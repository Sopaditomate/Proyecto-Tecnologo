"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import ChangePasswordSection from "./ChangePasswordSection";
import "./user-profile.css";
import ProfileSidebar from "./ProfileSideBar";
import ProfileForm from "./ProfileForm";
import OrdersSection from "./OrdersSection";

// Configurar la URL base de la API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Profile() {
  const location = useLocation();

  // Obtener activeTab del state de la navegación, con fallback a "profile"
  const initialTab = location.state?.activeTab || "profile";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({});
  const [originalForm, setOriginalForm] = useState({});
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
    axios.defaults.baseURL = API_URL;
  }, []);

  // Actualizar activeTab si cambia el state de la navegación
  useEffect(() => {
    if (location.state?.activeTab) {
      console.log("Cambiando a pestaña:", location.state.activeTab);
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Limpiar el state de navegación para evitar problemas futuros
  useEffect(() => {
    if (location.state?.activeTab) {
      const timer = setTimeout(() => {
        window.history.replaceState(null, "", location.pathname);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  useEffect(() => {
    loadProfile();
    if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await axios.get("/user/profile", {
        withCredentials: true,
      });

      if (response.data.success) {
        const userData = response.data.data;

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

        setPhoneVerified(phoneVerifiedStatus);
        setEmailVerified(emailVerifiedStatus);
      } else {
        showNotification(
          "Error al cargar el perfil: " + response.data.message,
          "error"
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
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
      const response = await axios.get("/user/orders", {
        withCredentials: true,
      });

      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      }
    } catch (error) {
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
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

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

    if (!hasChanges()) {
      showNotification("No hay cambios para guardar", "error");
      return;
    }

    setTouchedFields({
      nombres: true,
      apellidos: true,
      telefono: true,
      direccion: true,
    });

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

      if (response.data.success) {
        showNotification("Perfil actualizado exitosamente");
        setEditing(false);
        setProfile(form);
        setOriginalForm(form);
        setTouchedFields({});
        await loadProfile();
      } else {
        showNotification(
          response.data.message || "Error al actualizar el perfil",
          "error"
        );
      }
    } catch (error) {
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
      const response = await axios.post(
        "/user/verify-phone/send",
        {
          telefono: form.telefono.trim(),
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setPhoneStatus(response.data.message);
        if (response.data.code) {
          setPhoneStatus(
            `${response.data.message} - Código: ${response.data.code}`
          );
        }
      } else {
        setPhoneStatus(response.data.message || "Error al enviar código");
      }
    } catch (error) {
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
      const response = await axios.post(
        "/user/verify-phone/confirm",
        {
          codigo: phoneCode,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setPhoneVerified(true);
        setPhoneStatus("✅ " + response.data.message);
        setPhoneCode("");
        setProfile((prev) => ({
          ...prev,
          verified_phone: 1,
        }));
        setTimeout(() => {
          loadProfile();
        }, 1000);
      } else {
        setPhoneStatus("❌ " + (response.data.message || "Código inválido"));
      }
    } catch (error) {
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

      if (response.data.success) {
        setEmailVerified(true);
        setEmailStatus("✅ " + response.data.message);
        setProfile((prev) => ({
          ...prev,
          verified: 1,
          VERIFIED: 1,
        }));
        setTimeout(() => {
          loadProfile();
        }, 1000);
      } else {
        setEmailStatus(
          "❌ " + (response.data.message || "Error en la verificación")
        );
      }
    } catch (error) {
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
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [activeTab]);

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
