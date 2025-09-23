"use client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import TableDetails from "../../../components/table-components/TableDetails";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap"; // Importar el botón
import "./Productions.css";

const AdminProductionDetails = () => {
  const { ProductionId } = useParams();
  
  const [productionDetails, setProductionDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const VITE_API_URL = import.meta.env.VITE_API_URL; 
  useEffect(() => {
    fetchProductionDetails();
  }, [ProductionId]);

  // Obtener detalles de la producción
  const fetchProductionDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${VITE_API_URL}/produccion/production/${ProductionId}`
      );
      if (Array.isArray(response.data)) {
        setProductionDetails(response.data);
      } else {
        setProductionDetails([]);
      }
    } catch (error) {
      console.error("❌ Error al obtener los detalles de la producción:", error);
      setProductionDetails([]);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un detalle de producción
  const handleDeleteDetail = async (productionId, productId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este detalle de producción será eliminado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${VITE_API_URL}/produccion/production/${productionId}/detail/${productId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        Swal.fire({
          title: "Eliminado",
          text: "El detalle se eliminó correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Actualizar lista sin recargar
        setProductionDetails((prev) =>
          prev.filter((detail) => detail.id_product !== productId)
        );
      } else {
        const err = await response.json();
        Swal.fire("Error", err.message || "No se pudo eliminar el detalle", "error");
      }
    } catch (error) {
      console.error("Error eliminando detalle:", error);
      Swal.fire("Error", "Hubo un problema al eliminar el detalle.", "error");
    }
  };

  // Columnas para la tabla
  const columns = [
    {
      Header: "ID Producción",
      accessor: "id_production",
      headerStyle: { width: "150px" },
      Cell: ({ value }) => <strong>#{value}</strong>,
    },
    {
      Header: "ID Producto",
      accessor: "id_product",
      headerStyle: { width: "150px" },
    },
    {
      Header: "Nombre del Producto",
      accessor: "product_name",
      headerStyle: { width: "250px" },
    },
    {
      Header: "Cantidad Planificada",
      accessor: "planned_quantity",
      headerStyle: { width: "200px" },
      Cell: ({ value }) => <span>{value}</span>,
    },
    {
      Header: "Acciones",
      accessor: "acciones",
      headerStyle: { width: "200px" },
      Cell: ({ row }) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() =>
            handleDeleteDetail(row.id_production, row.id_product) // Cambié aquí para acceder directamente a row
          }
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="container">
      <div className="header-section">
        <h2>Detalles de Producción #{ProductionId}</h2>
        <p>Lista de productos planificados en esta producción</p>
      </div>
      <TableDetails
        btnBack={true}
        columns={columns}
        data={productionDetails}
        loading={loading}
        emptyMessage="No se encontraron detalles para esta producción"
      />
    </div>
  );
};

export default AdminProductionDetails;
