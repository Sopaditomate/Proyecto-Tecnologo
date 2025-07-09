"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./receta.css";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Recetasform() {
  const [recetas, setRecetas] = useState([]);
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [editReceta, setEditReceta] = useState(null);
  const [formData, setFormData] = useState(initialFormState());
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();

  function initialFormState() {
    return {
      ID_MATERIA: "",
      CANTIDAD_USAR: "",
    };
  }

  // Fetch all recipes for the specific product
  const fetchRecetas = () => {
    axios
      .get(`http://localhost:5001/api/recetas_crud/${id}`)
      .then((res) => setRecetas(res.data))
      .catch((err) => console.error("Error al cargar las recetas:", err));
  };

  useEffect(() => {
    if (id) {
      fetchRecetas(); // Fetch recipes when the ID changes
      fetchMateriasPrimas();
    }
  }, [id]);

  const fetchMateriasPrimas = () => {
    axios
      .get(`http://localhost:5001/api/recetas_crud/materia/${id}`) // Ajusta la URL según tu API
      .then((res) => {
        console.log("Datos de materias primas recibidos:", res.data[0]);
        setMateriasPrimas(res.data[0]);
      })
      .catch((err) => console.error("Error al cargar materias primas:", err));
  };

  const openInsertModal = () => {
    setFormData(initialFormState());
    setShowInsertModal(true);
  };

  const openEditModal = (receta) => {
    setEditReceta({
      ID_PRODUCT: receta.ID_PRODUCTO || id, // el ID del producto puede venir de la URL
      ID_MATERIAL: receta.ID_MATERIA,
    });
    setFormData({
      ID_MATERIA: receta.ID_MATERIA || "",
      CANTIDAD_USAR: receta.CANTIDAD_USAR || "",
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowInsertModal(false);
    setShowEditModal(false);
    setEditReceta(null);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new recipe
  const handleInsert = (e) => {
    e.preventDefault();
    if (!formData.ID_MATERIA || !formData.CANTIDAD_USAR) {
      toast.error("Por favor complete todos los campos", {
        closeButton: false,
        className: "receta-toast error",
      });
      return;
    }

    const dataToSend = {
      ID_PRODUCTO: id,
      ID_MATERIA: formData.ID_MATERIA,
      CANTIDAD_USAR: formData.CANTIDAD_USAR,
    };
    console.log("Datos a enviar:", dataToSend);
    axios
      .post(
        `http://localhost:5001/api/recetas_crud/${id}/${formData.ID_MATERIA}`,
        dataToSend
      )
      .then(() => {
        toast.success("✅ Receta agregada correctamente", {
          closeButton: false,
          className: "receta-toast success",
        });
        fetchRecetas();
        fetchMateriasPrimas();
        closeModals();
      })
      .catch((err) => {
        console.error("Error al agregar receta:", err);
        toast.error("❌ Error al insertar receta", {
          closeButton: false,
          className: "receta-toast error",
        });
      });
  };

  // Handle updating a selected recipe
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.ID_MATERIA || !formData.CANTIDAD_USAR) {
      toast.error("Por favor complete todos los campos", {
        closeButton: false,
        className: "receta-toast error",
      });
      return;
    }

    // Verifica que los datos a actualizar estén presentes
    console.log("Datos a actualizar:", editReceta, formData);

    // Realiza el PUT con los dos parámetros necesarios en la URL
    axios
      .put(
        `http://localhost:5001/api/recetas_crud/${editReceta.ID_PRODUCT}/${editReceta.ID_MATERIAL}`,
        { CANTIDAD_USAR: formData.CANTIDAD_USAR } // Asegúrate de que este campo esté en el cuerpo
      )
      .then(() => {
        toast.success("✅ Receta actualizada correctamente", {
          closeButton: false,
          className: "receta-toast success",
        });
        fetchRecetas();
        fetchMateriasPrimas();
        closeModals();
      })
      .catch((err) => {
        console.error("Error al actualizar receta:", err);
        toast.error("❌ Error al actualizar receta", {
          closeButton: false,
          className: "receta-toast error",
        });
      });
  };

  // Handle deleting a recipe
  const handleDelete = (receta) => {
    if (window.confirm("¿Estás seguro de eliminar esta receta?")) {
      axios
        .delete(
          `http://localhost:5001/api/recetas_crud/${id}/${receta.ID_MATERIA}`
        )
        .then(() => {
          toast.success("✅ Receta eliminada correctamente", {
            closeButton: false,
            className: "receta-toast success",
          });
          fetchRecetas();
          fetchMateriasPrimas();
        })
        .catch((err) => {
          console.error("Error al eliminar receta", err);
          toast.error("❌ No se pudo eliminar la receta", {
            closeButton: false,
            className: "receta-toast error",
          });
        });
    }
  };

  // Handle going back to the previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  // Extract unique materia prima options for the select input
  const tipoMateria = Array.from(
    new Map(
      materiasPrimas.map((p) => [
        p.ID_MATERIA,
        { ID_MATERIA: p.ID_MATERIA, NOMBRE: p.NOMBRE_MATE },
      ])
    ).values()
  );
  console.log(tipoMateria);

  // Render the form fields
  const renderFormFields = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Materia Prima</Form.Label>
        <Form.Select
          name="ID_MATERIA"
          value={formData.ID_MATERIA}
          onChange={handleChange}
        >
          <option value="">Seleccione materia prima</option>
          {tipoMateria.map((tipo) => (
            <option key={tipo.ID_MATERIA} value={tipo.ID_MATERIA}>
              {tipo.NOMBRE}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Cantidad a Usar</Form.Label>
        <Form.Control
          type="text"
          name="CANTIDAD_USAR"
          value={formData.CANTIDAD_USAR}
          onChange={handleChange}
          placeholder="Ej: 500g, 2 tazas, 1 litro..."
        />
      </Form.Group>
    </>
  );

  return (
    <Container fluid className="product-management-container">
      <h2 className="product-management-title">Recetas del Producto</h2>

      {/* Sección de controles */}

      <div className="controls-section" id="controls-section">
        <div>
          <div className="export-section" id="export-section">
            <div className="quick-actions" id="quick-actions">
              <Button
                className="w-100 clear-btn"
                id="back-btn"
                variant="outline-secondary"
                onClick={handleGoBack}
              >
                Volver
              </Button>
              <Button
                variant="success"
                className="add-product-btn-main"
                onClick={openInsertModal}
              >
                Agregar Nueva Receta
              </Button>
            </div>
            <span className="export-label" id="export-label">
              Exportar Recetas:
            </span>
            <div className="export-buttons-group" id="export-buttons-group">
              <Button
                variant="outline-danger"
                className="export-btn"
                onClick={() =>
                  window.open(
                    `http://localhost:5001/api/export/pdfreceta/${id}`,
                    "_blank"
                  )
                }
              >
                PDF
              </Button>
              <Button
                variant="outline-success"
                className="export-btn"
                onClick={() =>
                  window.open(
                    `http://localhost:5001/api/export/excelreceta/${id}`,
                    "_blank"
                  )
                }
              >
                Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor de tabla */}
      <div className="table-container">
        <div className="table-responsive">
          <Table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Materia Prima</th>
                <th>Cantidad Usar</th>
                <th style={{ width: "16%" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recetas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <div className="empty-state">
                      <p className="text-muted mb-0">
                        No hay recetas disponibles para este producto
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                recetas.map((receta) => {
                  const key =
                    receta.ID_PRODUCT && receta.ID_MATERIAL
                      ? `${receta.ID_PRODUCT}_${receta.ID_MATERIAL}`
                      : receta.ID_MATERIA;
                  return (
                    <tr key={key}>
                      <td>
                        <strong>{receta.NOMBRE_PROD}</strong>
                      </td>
                      <td>{receta.NOMBRE_MATE}</td>
                      <td>
                        <span className="fw-bold ">{receta.CANTIDAD_USAR}</span>
                      </td>
                      <td
                        className="container-buttons-product-v1"
                        id="container-buttons-product-v2"
                      >
                        <Button
                          className="action-btn btn-warning"
                          onClick={() => openEditModal(receta)}
                        >
                          Editar
                        </Button>
                        <Button
                          className="action-btn btn-danger"
                          onClick={() => handleDelete(receta)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal Insertar */}
      <Modal
        show={showInsertModal}
        onHide={closeModals}
        data-modal="insert"
        centered
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            Agregar Nueva Receta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handleInsert}>
            {renderFormFields()}
            <div className="modal-footer d-flex gap-2 justify-content-center mt-4">
              <Button type="submit" className="btn btn-primary">
                Insertar Receta
              </Button>
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={closeModals}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Editar */}
      <Modal
        show={showEditModal}
        onHide={closeModals}
        data-modal="edit"
        centered
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">Editar Receta</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handleUpdate}>
            {renderFormFields()}
            <div className="modal-footer d-flex gap-2 justify-content-center mt-4">
              <Button type="submit" className="btn btn-primary">
                Actualizar Receta
              </Button>
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={closeModals}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Container>
  );
}
