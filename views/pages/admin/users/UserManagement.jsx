"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Button } from "react-bootstrap";
import TableContainer from "../../../components/table-components/TableContainer";
import "../../../components/table-components/table-components.css";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userStatus, setUserStatus] = useState({});
  const [loadingIds, setLoadingIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      console.log("🔍 INICIANDO ANÁLISIS DE USUARIOS:");
      console.log("Total usuarios recibidos:", users.length);

      const initialStatus = {};
      users.forEach((user, index) => {
        // Mostrar TODA la información del usuario
        console.log(`\n--- Usuario ${index + 1} ---`);
        console.log("Objeto completo:", user);
        console.log("ID:", user.id_user);
        console.log("Email:", user.email);
        console.log("ID_STATE:", user.ID_STATE);
        console.log("Tipo de ID_STATE:", typeof user.ID_STATE);
        console.log("ID_STATE === 1:", user.ID_STATE === 1);
        console.log("ID_STATE == 1:", user.ID_STATE == 1);
        console.log("ID_STATE === '1':", user.ID_STATE === "1");

        // Probar diferentes formas de interpretar el estado
        let isActive = false;

        if (user.ID_STATE === 1 || user.ID_STATE === "1") {
          isActive = true;
        } else if (user.ID_STATE === 2 || user.ID_STATE === "2") {
          isActive = false;
        } else {
          console.warn(`⚠️ Valor inesperado de ID_STATE: ${user.ID_STATE}`);
          // Por defecto, asumir inactivo si no entendemos el valor
          isActive = false;
        }

        console.log("Estado calculado (isActive):", isActive);
        initialStatus[user.id_user] = isActive;
      });

      console.log("\n🎯 ESTADO INICIAL FINAL:", initialStatus);
      setUserStatus(initialStatus);
    }
  }, [users]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${VITE_API_URL}/user/info`);
      console.log("🌐 RESPUESTA COMPLETA DE LA API:");
      console.log("Status:", response.status);
      console.log("Headers:", response.headers);
      console.log("Data:", response.data);
      console.log("Tipo de data:", typeof response.data);
      console.log("Es array:", Array.isArray(response.data));

      if (response.data && response.data.length > 0) {
        console.log("Primer usuario como ejemplo:", response.data[0]);
        console.log(
          "Claves del primer usuario:",
          Object.keys(response.data[0])
        );
      }

      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("❌ Error al obtener los usuarios:", error);
      toast.error(
        "No se pudo cargar la lista de usuarios. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole && selectedRole !== "Todos") {
      filtered = filtered.filter((user) => user.role_name === selectedRole);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const toggleStatus = async (id_user) => {
    const currentStatus = userStatus[id_user];
    console.log(`🔄 TOGGLE STATUS para usuario ${id_user}:`);
    console.log("Estado actual en userStatus:", currentStatus);

    // Buscar el usuario en el array para ver su ID_STATE actual
    const user = users.find((u) => u.id_user === id_user);
    console.log("Usuario encontrado:", user);
    console.log("ID_STATE en BD:", user?.ID_STATE);

    const confirmResult = await Swal.fire({
      title: `¿Estás seguro de ${
        currentStatus ? "desactivar" : "activar"
      } este usuario?`,
      text: `Este cambio se aplicará inmediatamente.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmResult.isConfirmed) return;
    if (loadingIds.includes(id_user)) return;

    setLoadingIds((prev) => [...prev, id_user]);

    try {
      const response = await axios.put(
        `${VITE_API_URL}/user/state/${id_user}`
      );
      console.log("✅ Respuesta del servidor:", response.data);

      const newStatus = !currentStatus;
      console.log("Nuevo estado local:", newStatus);

      setUserStatus((prev) => ({
        ...prev,
        [id_user]: newStatus,
      }));

      // Actualizar también el array de usuarios
      const newIDState = newStatus ? 1 : 2;
      setUsers((prev) =>
        prev.map((user) =>
          user.id_user === id_user ? { ...user, ID_STATE: newIDState } : user
        )
      );

      setFilteredUsers((prev) =>
        prev.map((user) =>
          user.id_user === id_user ? { ...user, ID_STATE: newIDState } : user
        )
      );

      toast.success(
        `Usuario ${id_user} ha sido ${newStatus ? "activado" : "desactivado"}.`
      );
    } catch (error) {
      console.error("❌ Error al cambiar estado del usuario:", error);
      Swal.fire(
        "Error",
        "No se pudo cambiar el estado del usuario. Intenta nuevamente.",
        "error"
      );
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== id_user));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedRole("");
  };

  // Configuración de columnas
  const columns = [
    {
      Header: "ID",
      accessor: "id_user",
      headerStyle: { width: "80px" },
      Cell: ({ value }) => <strong>#{value}</strong>,
    },
    {
      Header: "Nombre",
      accessor: "first_name",
      headerStyle: { width: "120px" },
      Cell: ({ value }) => <span>{value}</span>,
    },
    {
      Header: "Apellido",
      accessor: "last_name",
      headerStyle: { width: "120px" },
      Cell: ({ value }) => <span>{value}</span>,
    },
    {
      Header: "Correo",
      accessor: "email",
      headerStyle: { width: "200px" },
      Cell: ({ value }) => <span className="text-break">{value}</span>,
    },
    {
      Header: "Dirección",
      accessor: "address",
      headerStyle: { width: "180px" },
      Cell: ({ value }) => (
        <span
          className="text-truncate d-inline-block"
          style={{ maxWidth: "150px" }}
        >
          {value || "No especificada"}
        </span>
      ),
    },
    {
      Header: "Teléfono",
      accessor: "phone",
      headerStyle: { width: "120px" },
      Cell: ({ value }) => <span>{value || "No especificado"}</span>,
    },
    {
      Header: "Rol",
      accessor: "role_name",
      headerStyle: { width: "100px" },
      Cell: ({ value }) => <span className="badge bg-primary">{value}</span>,
    },
    {
      Header: "Estado",
      headerStyle: { width: "100px" },
      Cell: ({ row }) => {
        const localStatus = userStatus[row.original.id_user];
        const dbState = row.original.ID_STATE;

        return (
          <div>
            <span
              className={`badge ${localStatus ? "bg-success" : "bg-danger"}`}
            >
              {localStatus ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
    },
    {
      Header: "Acciones",
      headerStyle: { width: "120px" },
      Cell: ({ row }) => {
        const isActive = userStatus[row.original.id_user];
        const isLoading = loadingIds.includes(row.original.id_user);
        return (
          <Button
            variant={isActive ? "danger" : "success"}
            onClick={() => toggleStatus(row.original.id_user)}
            size="sm"
            disabled={isLoading}
            className="action-btn"
          >
            {isLoading ? "Procesando..." : isActive ? "Inactivar" : "Activar"}
          </Button>
        );
      },
    },
  ];

  // Paginación
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Extraer roles únicos para el filtro
  const rolesUnicos = [...new Set(users.map((user) => user.role_name))].filter(
    Boolean
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <TableContainer
        title="Gestión de Usuarios"
        subtitle="Administra los usuarios del sistema y sus estados"
        searchLabel="Buscar Usuarios"
        searchPlaceholder="Buscar por nombre, apellido, correo, dirección, teléfono o rol..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterLabel="Filtrar por Rol"
        filterValue={selectedRole}
        onFilterChange={setSelectedRole}
        filterOptions={rolesUnicos}
        onClear={handleClearFilters}
        showAdd={false}
        showHistory={false}
        showUpload={false}
        exportOptions={[
          {
            label: "PDF",
            onClick: () => console.log("Exportar PDF"),
            variant: "outline-danger",
          },
          {
            label: "Excel",
            onClick: () => console.log("Exportar Excel"),
            variant: "outline-success",
          },
        ]}
        columns={columns}
        data={paginatedUsers}
        loading={loading}
        emptyMessage={
          searchTerm || selectedRole
            ? "No se encontraron usuarios con los criterios de búsqueda"
            : "No hay usuarios registrados en el sistema"
        }
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
      />
    </>
  );
};
