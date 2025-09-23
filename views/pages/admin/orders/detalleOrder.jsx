"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container, Table, Button, Card, Row, Col } from "react-bootstrap";

export function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  // Cargar datos del pedido
  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${VITE_API_URL}/pedidos/orders/${orderId}`);
      console.log("✅ API GET response:", data);

      if (Array.isArray(data)) {
        setData(data);
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

  // Manejar volver atrás
  const handleGoBack = () => {
    navigate(-1);
  };

  // Calcular total del pedido
  const calculateTotal = () => {
    if (!data || data.length === 0) return 0;
    return data.reduce((total, item) => {
      const subtotal = parseFloat(item.quantity || 0) * parseFloat(item.final_price || 0);
      return total + subtotal;
    }, 0);
  };

  // Calcular descuento por producto
  const calculateProductDiscount = (originalPrice, finalPrice, quantity) => {
    const discountPerUnit = parseFloat(originalPrice || 0) - parseFloat(finalPrice || 0);
    return discountPerUnit * parseFloat(quantity || 0);
  };

  // Columnas (solo para headers de la tabla)
  const columns = [
    { Header: "Producto", headerStyle: { width: "300px" } },
    { Header: "Precio Unitario", headerStyle: { width: "150px" } },
    { Header: "Descuento", headerStyle: { width: "120px" } },
    { Header: "Cantidad", headerStyle: { width: "100px" } },
    { Header: "Precio Final", headerStyle: { width: "150px" } },
    { Header: "Subtotal", headerStyle: { width: "150px" } },
  ];

  // Info del cliente (del primer registro)
  const customerName = data.length > 0 ? `${data[0].customer_first_name} ${data[0].customer_last_name}` : "No disponible";
  const email = data.length > 0 ? data[0].customer_email : "No disponible";
  const userId = data.length > 0 ? data[0].id_user : "No disponible";
  const createdAt = data.length > 0 ? new Date(data[0].created_at).toLocaleString() : "No disponible";

  return (
    <Container fluid className="reusable-component-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Título */}
      <div className="table-header text-center mt-4 mb-5">
        <h2>{`Detalles del Pedido #${orderId}`}</h2>
        <p className="text-muted">Visualiza los productos que contiene esta orden</p>
      </div>
      
      {/* Info del cliente y pedido */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            {/* Cliente */}
            <Col md={6}>
              <h5 style={{ color: "#ff7f32" }} className="mb-3">Información del Cliente</h5>
              <p><strong>Nombre:</strong> {customerName}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Teléfono:</strong> {data.length > 0 ? data[0].customer_phone : "No disponible"}</p>
              <p><strong>Dirección:</strong> {data.length > 0 ? data[0].customer_address : "No disponible"}</p>
              <p><strong>ID Usuario:</strong> {userId}</p>
            </Col>

            {/* Pedido */}
            <Col md={6}>
              <h5 style={{ color: "#ff7f32" }} className="mb-3">Información del Pedido</h5>
              <p><strong>ID Pedido:</strong> {orderId}</p>
              <p><strong>Fecha:</strong> {createdAt}</p>
            </Col>
          </Row>

          {/* Botón volver */}
          <div className="d-flex justify-content-start mt-4 w-100">
            <Button
              className="px-5 py-2"
              variant="outline-secondary"
              style={{ minWidth: "220px" }} // ⬅️ más ancho
              onClick={handleGoBack}
            >
              Volver
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Tabla de productos */}
      <div className="table-container">
        <div className="table-responsive">
          <Table className="table">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index} style={col.headerStyle}>
                    {col.Header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">Cargando...</td>
                </tr>
              ) : data && data.length > 0 ? (
                <>
                  {data.map((row, index) => {
                    const subtotal = parseFloat(row.quantity || 0) * parseFloat(row.final_price || 0);
                    const productDiscount = calculateProductDiscount(row.product_price, row.final_price, row.quantity);

                    return (
                      <tr key={index}>
                        <td>{row.product_name || "Sin nombre"}</td>
                        <td>
                          ${!isNaN(row.product_price) ?
                            parseFloat(row.product_price).toLocaleString("es-ES", { minimumFractionDigits: 0 }) : "0"}
                        </td>
                        <td>
                          {productDiscount > 0 ? (
                            <span className="text-success">
                              -${productDiscount.toLocaleString("es-ES", { minimumFractionDigits: 0 })}
                            </span>
                          ) : (
                            <span className="text-muted">Sin descuento</span>
                          )}
                        </td>
                        <td>{row.quantity || 0}</td>
                        <td>
                          ${!isNaN(row.final_price) ?
                            parseFloat(row.final_price).toLocaleString("es-ES", { minimumFractionDigits: 0 }) : "0"}
                        </td>
                        <td>
                          <strong>
                            ${subtotal.toLocaleString("es-ES", { minimumFractionDigits: 0 })}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Fila total */}
                  <tr className="table-active border-top-2">
                    <td colSpan={5} className="text-end">
                      <strong className="fs-5">TOTAL A PAGAR:</strong>
                    </td>
                    <td>
                      <strong className="fs-5 text-success">
                        ${calculateTotal().toLocaleString("es-ES", { minimumFractionDigits: 0 })}
                      </strong>
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    No se encontraron detalles para este pedido
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </Container>
  );
}

export default AdminOrderDetails;
