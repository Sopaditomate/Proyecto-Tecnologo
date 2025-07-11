"use client";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import TableContainer from "../../../components/table-components/TableContainer";
import "../../../components/table-components/table-components.css";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

export function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

 const fetchOrderDetails = async () => {
  setLoading(true);
  try {
    const { data } = await axios.get(`http://localhost:5001/api/pedidos/orders/${orderId}`);
    console.log("✅ API GET response:", data);
    if (Array.isArray(data)) {
      setDetails(data);
    } else {
      throw new Error("Respuesta no válida al obtener detalles.");
    }
  } catch (error) {
    console.error("❌ Error al obtener los detalles:", error.response?.data || error.message);
    toast.error("No se pudieron cargar los detalles del pedido.");
  } finally {
    setLoading(false);
  }
};

  const columns = [
    { Header: "ID Detalle", accessor: "id_order_detail" },
    { Header: "ID Pedido", accessor: "id_order" },
    { Header: "ID Usuario", accessor: "id_user" },
    {
      Header: "Estado Pedido",
      accessor: "id_order_status",
      Cell: ({ value }) => <span>{value}</span>,
    },
    {
      Header: "Fecha",
      accessor: "created_at",
      Cell: ({ value }) => new Date(value).toLocaleString(),
    },
    {
      Header: "Descuento",
      accessor: "total_discount",
      Cell: ({ value }) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: "Total Pedido",
      accessor: "total_amount",
      Cell: ({ value }) => `$${parseFloat(value).toFixed(2)}`,
    },
    { Header: "ID Producto", accessor: "id_product" },
    { Header: "Producto", accessor: "product_name" },
    {
      Header: "Precio Producto",
      accessor: "product_price",
      Cell: ({ value }) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: "Cantidad",
      accessor: "quantity",
    },
    {
      Header: "Precio Final",
      accessor: "final_price",
      Cell: ({ value }) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: "Subtotal",
      accessor: "subtotal",
      Cell: ({ row }) => {
        const qty = row.original.quantity;
        const price = row.original.final_price;
        const subtotal = parseFloat(qty) * parseFloat(price);
        return `$${subtotal.toFixed(2)}`;
      },
    },
  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">
        ← Volver
      </Button>

      <TableContainer
        title={`Detalles del Pedido #${orderId}`}
        subtitle="Visualiza los productos que contiene esta orden"
        columns={columns}
        data={details}
        loading={loading}
        emptyMessage="No se encontraron detalles para este pedido"
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        totalItems={details.length}
        itemsPerPage={details.length}
        searchLabel=""
        searchPlaceholder=""
        searchTerm=""
        onSearchChange={() => {}}
        filterLabel=""
        filterValue=""
        onFilterChange={() => {}}
        filterOptions={[]}
        onClear={() => {}}
        showAdd={false}
        showUpload={false}
        showHistory={false}
        showPagination={false}
      />
    </>
  );
}
