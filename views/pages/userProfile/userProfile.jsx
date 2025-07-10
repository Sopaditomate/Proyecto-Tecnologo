"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import ChangePasswordSection from "./ChangePasswordSection";
import "./user-profile.css";
import ProfileSidebar from "./ProfileSideBar";
import ProfileForm from "./ProfileForm";
import OrdersSection from "./OrdersSection";
import VerificationSection from "./VerificationSection";
import { registerSchema } from "../../utils/validationSchema";

// Configurar la URL base de la API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({});
  const [originalForm, setOriginalForm] = useState({}); // Para comparar cambios
  const [editing, setEditing] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [phoneStatus, setPhoneStatus] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationLink, setVerificationLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [errors, setErrors] = useState({});

  // Configurar axios con el token y URL base
  useEffect(() => {
    // Configurar URL base
    axios.defaults.baseURL = API_URL;
  }, []);

  useEffect(() => {
    loadProfile();
    if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      console.log("Loading profile...");
      const response = await axios.get("/user/profile", {
        withCredentials: true,
      });
      console.log("Profile response:", response.data);

      if (response.data.success) {
        const userData = response.data.data;
        console.log("User data received:", userData);

        // Normaliza los nombres de los campos
        const normalized = {
          nombres: userData.NOMBRES || "",
          apellidos: userData.APELLIDOS || "",
          direccion: userData.DIRECCION || "",
          telefono: userData.TELEFONO || "",
          usuario: userData.USUARIO || "",
        };

        setProfile(userData);
        setForm(normalized);
        setOriginalForm(normalized);

        // Verificar el estado de verificación del teléfono
        const phoneVerifiedStatus = userData.verified_phone === 1;
        const emailVerifiedStatus = userData.verified === 1;

        console.log("Setting verification states:", {
          phone: phoneVerifiedStatus,
          email: emailVerifiedStatus,
        });

        setPhoneVerified(phoneVerifiedStatus);
        setEmailVerified(emailVerifiedStatus);
      } else {
        console.error("Error en respuesta:", response.data.message);
        showNotification(
          "Error al cargar el perfil: " + response.data.message,
          "error"
        );
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      if (error.response?.status === 401) {
        console.log("Unauthorized, redirecting to login");
        localStorage.removeItem("token");
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
      } else {
        showNotification(
          "Error al cargar el perfil. Por favor, recarga la página.",
          "error"
        );
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log("Loading orders...");
      const response = await axios.get("http://localhost:5001/api/user/orders", {
        withCredentials: true,
      });
      console.log("Orders response:", response.data);

      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      } else {
        console.error("Error en respuesta:", response.data.message);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Marcar el campo como tocado
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  // Función para detectar si hay cambios reales
  const hasChanges = () => {
    if (!originalForm || !form) return false;

    return (
      (form.nombres || "").trim() !== (originalForm.nombres || "").trim() ||
      (form.apellidos || "").trim() !== (originalForm.apellidos || "").trim() ||
      (form.direccion || "").trim() !== (originalForm.direccion || "").trim() ||
      (form.telefono || "").trim() !== (originalForm.telefono || "").trim()
    );
  };

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent =
      type === "success" ? "✓ " + message : "❌ " + message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const getFieldError = (fieldName, value) => {
    if (!touchedFields[fieldName]) return "";

    if (!value || !value.trim()) {
      switch (fieldName) {
        case "nombres":
          return "El nombre es obligatorio";
        case "apellidos":
          return "Los apellidos son obligatorios";
        case "telefono":
          return "El teléfono es obligatorio";
        case "direccion":
          return "La dirección es obligatoria";
        default:
          return "";
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar si hay cambios reales
    if (!hasChanges()) {
      showNotification("No hay cambios para guardar", "error");
      return;
    }

    // Marcar todos los campos como tocados para mostrar errores
    setTouchedFields({
      nombres: true,
      apellidos: true,
      telefono: true,
      direccion: true,
    });

    // Validar campos requeridos
    if (
      !form.nombres?.trim() ||
      !form.apellidos?.trim() ||
      !form.direccion?.trim() ||
      !form.telefono?.trim()
    ) {
      showNotification("Todos los campos son obligatorios", "error");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Updating profile with:", form);
      const response = await axios.put(
        "/user/profile",
        {
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          direccion: form.direccion.trim(),
          telefono: form.telefono.trim(),
        },
        {
          withCredentials: true,
        }
      );

      console.log("Update response:", response.data);

      if (response.data.success) {
        showNotification("Perfil actualizado exitosamente");
        setEditing(false);
        setProfile(form);
        setOriginalForm(form); // Actualizar estado original
        setTouchedFields({}); // Limpiar campos tocados
        // Recargar perfil para obtener datos actualizados
        await loadProfile();
      } else {
        showNotification(
          response.data.message || "Error al actualizar el perfil",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.data?.message) {
        showNotification(error.response.data.message, "error");
      } else {
        showNotification("Error al actualizar el perfil", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneCode = async () => {
    if (!form.telefono?.trim()) {
      setPhoneStatus("Por favor ingresa un número de teléfono válido");
      return;
    }

    setPhoneStatus("Enviando código...");
    try {
      console.log("Sending phone verification to:", form.telefono);
      const response = await axios.post(
        "/user/verify-phone/send",
        {
          telefono: form.telefono.trim(),
        },
        {
          withCredentials: true,
        }
      );

      console.log("SMS response:", response.data);

      if (response.data.success) {
        setPhoneStatus(response.data.message);
        // En desarrollo, mostrar el código
        if (response.data.code) {
          setPhoneStatus(
            `${response.data.message} - Código: ${response.data.code}`
          );
        }
      } else {
        setPhoneStatus(response.data.message || "Error al enviar código");
      }
    } catch (error) {
      console.error("Error sending phone code:", error);
      setPhoneStatus("Error al enviar código de verificación");
    }
  };

  const confirmPhone = async () => {
    if (!phoneCode || phoneCode.length !== 6) {
      setPhoneStatus("Por favor ingresa un código válido de 6 dígitos");
      return;
    }

    setPhoneStatus("Verificando código...");
    try {
      console.log("Confirming phone with code:", phoneCode);
      const response = await axios.post(
        "/user/verify-phone/confirm",
        {
          codigo: phoneCode,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Confirm phone response:", response.data);

      if (response.data.success) {
        // Actualizar inmediatamente el estado local
        setPhoneVerified(true);
        setPhoneStatus("✅ " + response.data.message);
        setPhoneCode("");

        // Actualizar el perfil local también
        setProfile((prev) => ({
          ...prev,
          verified_phone: 1,
        }));

        console.log("Phone verification successful, state updated");

        // Opcional: recargar perfil después de un breve delay
        setTimeout(() => {
          loadProfile();
        }, 1000);
      } else {
        setPhoneStatus("❌ " + (response.data.message || "Código inválido"));
      }
    } catch (error) {
      console.error("Error confirming phone:", error);
      setPhoneStatus("❌ Error al verificar código");
    }
  };

  const sendEmailCode = async () => {
    setEmailStatus("Enviando verificación...");
    try {
      const response = await axios.post(
        "/user/verify-email/send",
        {},
        { withCredentials: true }
      );

      console.log("Email verification response:", response.data);

      if (response.data.success) {
        setEmailStatus(response.data.message);
        if (response.data.verificationLink) {
          setVerificationLink(response.data.verificationLink);
        }
      } else {
        setEmailStatus(
          "❌ " + (response.data.message || "Error al enviar verificación")
        );
      }
    } catch (error) {
      console.error("Error sending email verification:", error);
      setEmailStatus("❌ Error al enviar correo de verificación");
    }
  };

  const confirmEmailVerification = async (token) => {
    setEmailStatus("Verificando correo...");
    try {
      const response = await axios.post(
        "/user/verify-email/confirm",
        { token },
        { withCredentials: true }
      );

      console.log("Email confirmation response:", response.data);

      if (response.data.success) {
        // Actualizar inmediatamente el estado local
        setEmailVerified(true);
        setEmailStatus("✅ " + response.data.message);

        // Actualizar el perfil local también
        setProfile((prev) => ({
          ...prev,
          verified: 1,
          VERIFIED: 1,
        }));

        console.log("Email verification successful, state updated");

        // Opcional: recargar perfil después de un breve delay
        setTimeout(() => {
          loadProfile();
        }, 1000);
      } else {
        setEmailStatus(
          "❌ " + (response.data.message || "Error en la verificación")
        );
      }
    } catch (error) {
      console.error("Error confirming email:", error);
      setEmailStatus("❌ Error al verificar el correo");
    }
  };

  const filterOrders = (status) => {
    setOrderFilter(status);
    if (status === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter(
          (order) => order.estado.toLowerCase() === status.toLowerCase()
        )
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      primary: date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      secondary: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      Recepción: "status-recepcion",
      Preparando: "status-preparando",
      Empaquetado: "status-empaquetado",
      Envio: "status-envio",
      Entregado: "status-entregado",
    };
    return statusMap[status] || "status-recepcion";
  };

  const getMessageClass = (message) => {
    if (
      message.includes("exitosamente") ||
      message.includes("verificado") ||
      message.includes("✅")
    ) {
      return "success";
    } else if (
      message.includes("Error") ||
      message.includes("inválido") ||
      message.includes("❌")
    ) {
      return "error";
    }
    return "info";
  };

  // Verificar token de email en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token && activeTab === "verification") {
      confirmEmailVerification(token);
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [activeTab]);

  // Debug: mostrar estados actuales
  useEffect(() => {
    console.log("Current verification states:", {
      phoneVerified,
      emailVerified,
      profile: profile,
    });
  }, [phoneVerified, emailVerified, profile]);

  if (profileLoading) {
    return (
      <div className="profile-editor-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-editor-container">
      <div className="profile-editor">
        <div className="profile-header"></div>
        <div className="profile-content">
          <ProfileSidebar
            form={form}
            profile={profile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div className="profile-main">
            {activeTab === "profile" && (
              <ProfileForm
                form={form}
                profile={profile}
                editing={editing}
                isLoading={isLoading}
                hasChanges={hasChanges}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                setEditing={setEditing}
                originalForm={originalForm}
                setForm={setForm}
                setTouchedFields={setTouchedFields}
                getFieldError={getFieldError}
                touchedFields={touchedFields}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {activeTab === "orders" && (
              <OrdersSection
                loading={loading}
                filteredOrders={filteredOrders}
                orderFilter={orderFilter}
                filterOrders={filterOrders}
                formatDate={formatDate}
                formatPrice={formatPrice}
                getStatusClass={getStatusClass}
              />
            )}
            {activeTab === "verification" && (
              <VerificationSection
                phoneVerified={phoneVerified}
                phoneStatus={phoneStatus}
                phoneCode={phoneCode}
                setPhoneCode={setPhoneCode}
                sendPhoneCode={sendPhoneCode}
                confirmPhone={confirmPhone}
                form={form}
                emailVerified={emailVerified}
                emailStatus={emailStatus}
                sendEmailCode={sendEmailCode}
                verificationLink={verificationLink}
                getMessageClass={getMessageClass}
              />
            )}
            {activeTab === "password" && (
              <ChangePasswordSection
                email={profile.USUARIO || profile.email || ""}
                showNotification={showNotification}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
