"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import TableContainer from "../../../components/table-components/TableContainer";
import "../../../components/table-components/table-components.css";
import { Modal, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export const AdminOrders = () => {

  const statusFlow = {
    300000: [300001, 300005], // Recepción
    300001: [300002, 300005], // Preparando
    300002: [300003, 300005], // Empaquetado
    300003: [300004, 300005], // Envio
    300004: [],               // Entregado
    300005: [],               // Cancelado
  };
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [filterValue, setFilterValue] = useState(""); // Estado para estado del pedido
  const [searchTerm, setSearchTerm] = useState("");   // Estado para texto buscado
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedStatusId, setSelectedStatusId] = useState("");
  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env.VITE_API_URL 
  const [currentOrderStatus, setCurrentOrderStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchOrderStatuses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, filterValue]);

  const applyFilters = () => {
    let filtered = [...orders]; // Asegúrate de copiar los pedidos originales

    const term = searchTerm.trim().toLowerCase();

    if (term) {
      filtered = filtered.filter((order) => {
        const orderId = order.id_order?.toString().toLowerCase();
        const userId = order.id_user?.toString().toLowerCase();
        const statusName = orderStatuses.find(
          (s) => s.id_order_status === order.id_order_status
        )?.status_name?.toLowerCase();

        const createdAt = new Date(order.created_at)
          .toLocaleString()
          .toLowerCase();

        const totalAmount = order.total_amount?.toString().toLowerCase();

        return (
          orderId?.includes(term) ||
          userId?.includes(term) ||
          statusName?.includes(term) ||
          createdAt?.includes(term) ||
          totalAmount?.includes(term)
        );
      });
    }

    if (filterValue !== "") {
      filtered = filtered.filter(
        (order) => order.id_order_status.toString() === filterValue
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };


  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${VITE_API_URL}/pedidos/active-orders`);

      if (Array.isArray(response.data)) {
        const ordersWithConvertedValues = response.data.map((order) => ({
          ...order,
          total_discount: parseFloat(order.total_discount),
          total_amount: parseFloat(order.total_amount),
        }));

        setOrders(ordersWithConvertedValues);
        setFilteredOrders(ordersWithConvertedValues);

        console.log("🌐 RESPUESTA DE LA API:", response.data);
        console.log("Órdenes establecidas:", ordersWithConvertedValues);
      } else {
        throw new Error("La respuesta de la API no es un array.");
      }
    } catch (error) {
      console.error(
        "❌ Error al obtener los pedidos:",
        error.response ? error.response.data : error.message
      );
      toast.error("No se pudo cargar la lista de pedidos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatuses = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/pedidos/order-status`);
      if (Array.isArray(response.data)) {
        setOrderStatuses(response.data);
      } else {
        throw new Error("La respuesta del endpoint de estados no es un array.");
      }
    } catch (error) {
      console.error("❌ Error al obtener los estados:", error.response?.data || error.message);
      toast.error("No se pudieron cargar los estados de pedido.");
    }
  };

  const updateOrder = (orderId) => {
    setSelectedOrderId(orderId);

    // Buscar el pedido para saber su estado actual
    const order = orders.find(o => o.id_order === orderId);
    setCurrentOrderStatus(order?.id_order_status || null);

    setSelectedStatusId("");
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatusId) {
      toast.error("Selecciona un nuevo estado para continuar.");
      return;
    }

    if (!statusFlow[currentOrderStatus]?.includes(parseInt(selectedStatusId))) {
      toast.error("No puedes actualizar a ese estado desde el estado actual.");
      return;
    }

    // Aquí lanzamos la alerta con Swal
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se enviará un correo al usuario notificándole el cambio de estado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`${VITE_API_URL}/pedidos/orders/update-status`, {
          orderId: selectedOrderId,
          statusId: selectedStatusId,
        });

        toast.success(response.data.message || "Estado actualizado con éxito");

        fetchOrders();
        setShowModal(false);
        setSelectedOrderId(null);
        setSelectedStatusId("");
        setCurrentOrderStatus(null);
      } catch (error) {
        console.error("❌ Error al actualizar el estado:", error.response?.data || error.message);
        toast.error("Error al actualizar el estado del pedido");
      }
    } else {
      // Si cancela, no hacemos nada
      toast.info("Actualización cancelada");
    }
  };

  const viewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);

  };

  // Configuración de columnas
  const columns = [
    {
      Header: "Nombre del Cliente",
      accessor: "customer_name",
      headerStyle: { width: "200px" },
      Cell: ({ value }) => <span>{value || "Sin nombre"}</span>,
    },
    {
      Header: "Correo",
      accessor: "email",
      headerStyle: { width: "250px" },
      Cell: ({ value }) => <span>{value || "Sin correo"}</span>,
    },
    {
      Header: "Estado del Pedido",
      accessor: "id_order_status",
      headerStyle: { width: "150px" },
      Cell: ({ value }) => {
        const status = orderStatuses.find(status => status.id_order_status === value);

        if (!status) {
          return <span className="badge bg-secondary">Desconocido</span>;
        }

        // Mapea nombres de estado a colores de Bootstrap
        const colorMap = {
          "Recepción": "bg-warning text-dark",
          "Preparando": "bg-primary",
          "Empaquetado": "bg-info text-dark",
          "Envio": "bg-secondary",
          "Entregado": "bg-success"
        };

        const badgeClass = colorMap[status.status_name] || "bg-dark";

        return (
          <span className={`badge ${badgeClass}`}>
            {status.status_name}
          </span>
        );
      },
    },
    {
      Header: "Fecha de Creación",
      accessor: "created_at",
      headerStyle: { width: "150px" },
      Cell: ({ value }) => <span>{new Date(value).toLocaleString() || "Sin fecha"}</span>,
    },
    {
      Header: "Total Descuento",
      accessor: "total_discount",
      headerStyle: { width: "120px" },
      Cell: ({ value }) => (
        <span>${!isNaN(value) ? value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}</span>
      ),
    },
    {
      Header: "Total Monto",
      accessor: "total_amount",
      headerStyle: { width: "120px" },
      Cell: ({ value }) => (
        <span>${!isNaN(value) ? value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}</span>
      ),
    },
    {
      Header: "Acciones",
      headerStyle: { width: "200px" },
      Cell: ({ row }) => (
        <>
        <div className="d-flex gap-2" style={{ justifyContent: "center" }}>
          <Button
            variant="warning"
            className="action-btn"
            onClick={() => updateOrder(row.original.id_order)}
            size="sm"
          >
            Actualizar
          </Button>
          <Button
            variant="info"
             className="action-btn"
            onClick={() => viewDetails(row.original.id_order)}
            size="sm"
          >
            Detalles
          </Button>
        </div>
        </>
      ),
    },
  ];

  // Paginación
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const filterOptions = [
    ...orderStatuses.map((status) => ({
      label: status.status_name,
      value: status.id_order_status.toString(),
    })),
  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <TableContainer
        title="Gestión de Pedidos"
        subtitle="Administra los pedidos del sistema y sus estados"
        searchLabel="Buscar Pedidos"
        searchPlaceholder="Buscar por ID de usuario o ID de pedido..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterLabel="Estado del Pedido"
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        filterOptions={filterOptions}
        onClear={() => {
          setSearchTerm("");
          setFilterValue("");
          setFilteredOrders(orders);
          setCurrentPage(1);
        }}
        columns={columns}
        data={paginatedOrders}
        loading={loading}
        emptyMessage="No hay pedidos registrados en el sistema"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredOrders.length}
        itemsPerPage={itemsPerPage}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Estado del Pedido #{selectedOrderId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Selecciona el nuevo estado:</Form.Label>
            <Form.Control
              as="select"
              value={selectedStatusId}
              onChange={(e) => setSelectedStatusId(e.target.value)}
            >
              <option value="">Estados</option>
              {orderStatuses
                .filter(status => {
                  // Si no tenemos estado actual, mostramos todos (por seguridad)
                  if (!currentOrderStatus) return true;

                  // Solo mostrar estados permitidos para avanzar (y Cancelado)
                  return statusFlow[currentOrderStatus]?.includes(status.id_order_status);
                })
                .map((status) => (
                  <option key={status.id_order_status} value={status.id_order_status}>
                    {status.status_name}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Actualizar Estado
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
