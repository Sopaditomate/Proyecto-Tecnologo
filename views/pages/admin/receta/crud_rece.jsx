import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import './receta.css';
import { Container, Table, Button, Modal, Form } from 'react-bootstrap';

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
      CANTIDAD_USAR: ""
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
  };console.log(fetchMateriasPrimas)
  const openInsertModal = () => {
    setFormData(initialFormState());
    setShowInsertModal(true);
  };

  const openEditModal = (receta) => {
    setEditReceta({
      ID_PRODUCT: receta.ID_PRODUCTO || id, // el ID del producto puede venir de la URL
      ID_MATERIAL: receta.ID_MATERIA
    });
    setFormData({
      ID_MATERIA: receta.ID_MATERIA || "",
      CANTIDAD_USAR: receta.CANTIDAD_USAR || ""
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
      alert("Por favor complete todos los campos");
      return;
    }

    const dataToSend = {
      ID_PRODUCTO: id, 
      ID_MATERIA: formData.ID_MATERIA,
      CANTIDAD_USAR: formData.CANTIDAD_USAR
    };
console.log("Datos a enviar:", dataToSend);
    axios
      .post(`http://localhost:5001/api/recetas_crud/${id}/${formData.ID_MATERIA}`, dataToSend)
      .then(() => {
        alert("Receta agregada correctamente");
        fetchRecetas();
        fetchMateriasPrimas();
        closeModals();
      })
      .catch((err) => {
        console.error("Error al agregar receta:", err);
        alert("Error al insertar receta");
      });
  };

  // Handle updating a selected recipe
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.ID_MATERIA || !formData.CANTIDAD_USAR) {
      alert("Por favor complete todos los campos");
      return;
    }

    // Verifica que los datos a actualizar estén presentes
    console.log("Datos a actualizar:", editReceta, formData);

    // Realiza el PUT con los dos parámetros necesarios en la URL
    axios.put(
      `http://localhost:5001/api/recetas_crud/${editReceta.ID_PRODUCT}/${editReceta.ID_MATERIAL}`,
      { CANTIDAD_USAR: formData.CANTIDAD_USAR } // Asegúrate de que este campo esté en el cuerpo
    )
      .then(() => {
        alert("Receta actualizada correctamente");
        fetchRecetas();
        fetchMateriasPrimas();
        closeModals();
      })
      .catch((err) => {
        console.error("Error al actualizar receta:", err);
        alert("Error al actualizar receta");
      });

  };
  // Handle deleting a recipe
  const handleDelete = (receta) => {
    if (window.confirm("¿Estás seguro de eliminar esta receta?")) {
      axios
        .delete(`http://localhost:5001/api/recetas_crud/${id}/${receta.ID_MATERIA}`)
        .then(() => {
          alert("Receta eliminada correctamente");
          fetchRecetas();
          fetchMateriasPrimas();
        })
        .catch((err) => {
          console.error("Error al eliminar receta", err);
          alert("No se pudo eliminar la receta");
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
      materiasPrimas.map(p => [p.ID_MATERIA, { ID_MATERIA: p.ID_MATERIA, NOMBRE: p.NOMBRE_MATE }])
    ).values()
  ); console.log(tipoMateria)

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
          {tipoMateria.map(tipo => (
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
        />
      </Form.Group>
    </>
  );

  return (
    <Container className="container mt-4">
      <h2>Recetas del Producto </h2>
      {/* Export Buttons */}
      <div className="mb-3">
        <Button
          variant="outline-primary"
          className="me-2"
          onClick={() => window.open(`http://localhost:5001/api/export/pdfreceta/${id}`, '_blank')}
        >
          Exportar PDF
        </Button>

        <Button
          variant="outline-success"
          onClick={() => window.open(`http://localhost:5001/api/export/excelreceta/${id}`, '_blank')}
        >
          Exportar Excel
        </Button>
      </div>
      <Button className="btn btn-secondary mb-3" onClick={handleGoBack}>
        Volver
      </Button>
      <Button variant="success" className="mb-3" onClick={openInsertModal}>
        Agregar Nueva Receta
      </Button>

      <Table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Materia Prima</th>
            <th>Cantidad Usar</th>
            <th>Acciones</th>
          </tr>
        </thead>
   <tbody>
  {recetas.map((receta) => {
    const key = receta.ID_PRODUCT && receta.ID_MATERIAL ? `${receta.ID_PRODUCT}_${receta.ID_MATERIAL}` : receta.ID_MATERIA; // Cambia esto según tu lógica
    return (
      <tr key={key}>
        <td>{receta.NOMBRE_PROD}</td>
        <td>{receta.NOMBRE_MATE}</td>
        <td>{receta.CANTIDAD_USAR}</td>
        <td>
          <Button
            variant="warning"
            className="btn-sm me-2"
            onClick={() => openEditModal(receta)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            className="btn-sm"
            onClick={() => handleDelete(receta)}
          >
            Eliminar
          </Button>
        </td>
      </tr>
    );
  })}
</tbody>

      </Table>

      {/* Modal Insertar */}
      <Modal show={showInsertModal} onHide={closeModals}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Receta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleInsert}>
            {renderFormFields()}
            <Button type="submit" variant="primary">Insertar</Button>
            <Button type="button" variant="secondary" className="ms-2" onClick={closeModals}>
              Cancelar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Editar */}
      <Modal show={showEditModal} onHide={closeModals}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Receta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            {renderFormFields()}
            <Button type="submit" variant="primary">Actualizar</Button>
            <Button type="button" variant="secondary" className="ms-2" onClick={closeModals}>
              Cancelar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
