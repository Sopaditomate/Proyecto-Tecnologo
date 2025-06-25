import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import './Products.css';
import { Container, Table, Button, Modal, Form } from 'react-bootstrap';

export const AdminProducts = () => {
  const [productos, setProductos] = useState([]);
  const [editProd, setEditProd] = useState(null);
  const [formProd, setFormProd] = useState(initialFormState());
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();

  function initialFormState() {
    return {
      ID_TIPO_PRO: "",
      NOMBRE: "",
      PRECIO: "",
      DESCRIPCION: "",
      IMAGEN_URL: "",
      NOTA_ACTUAL: "",
      ADVERTENCIA: ""
    };
  }

  const fetchProductos = () => {
    axios
      .get("http://localhost:5001/api/productos_crud")
      .then(res => setProductos(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const openInsertModal = () => {
    setFormProd(initialFormState());
    setShowInsertModal(true);
  };

  const openEditModal = (producto) => {
    setEditProd(producto);
    setFormProd({
      ID_TIPO_PRO: producto.NOMBRE_TIPO_PRO || "",
      NOMBRE: producto.NOMBRE_PROD || "",
      PRECIO: producto.PRECIO || "",
      DESCRIPCION: producto.DESCRIPCION || "",
      IMAGEN_URL: producto.IMAGEN_URL || "",
      NOTA_ACTUAL: producto.NOTA_ACTUAL || "",
      ADVERTENCIA: producto.ADVERTENCIA || ""
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowInsertModal(false);
    setShowEditModal(false);
    setEditProd(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormProd(prev => ({ ...prev, [name]: value }));
  };

  const handleInsert = (e) => {
    e.preventDefault();
    if (!formProd.NOMBRE || !formProd.PRECIO) {
      alert("Por favor completa al menos el nombre y precio");
      return;
    }

    axios.post("http://localhost:5001/api/productos_crud", formProd)
      .then(() => {
        alert("Producto insertado correctamente");
        fetchProductos();
        closeModals();
      })
      .catch(err => {
        console.error("Error al insertar producto", err);
        alert("Error al insertar producto");
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formProd.NOMBRE || !formProd.PRECIO) {
      alert("Por favor completa al menos el nombre y precio");
      return;
    }

    axios.put(`http://localhost:5001/api/productos_crud/${editProd.ID_PRODUCTO}`, formProd)
      .then(() => {
        alert("Producto actualizado correctamente");
        fetchProductos();
        closeModals();
      })
      .catch(err => {
        console.error("Error al actualizar producto", err);
        alert("Error al actualizar producto");
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      axios
        .delete(`http://localhost:5001/api/productos_crud/product/${id}`)
        .then(() => {
          alert("Producto eliminado correctamente");
          fetchProductos();
        })
        .catch((err) => {
          console.error("Error al eliminar producto", err);
          alert("No se pudo eliminar el producto");
        });
    }
  };

  const tiposProducto = Array.from(
    new Map(
      productos.map(p => [p.ID_TIPO_PRO, { ID_TIPO_PRO: p.ID_TIPO_PRO, NOMBRE: p.NOMBRE_TIPO_PRO }])
    ).values()
  );

  const renderFormFields = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Tipo de Producto</Form.Label>
        <Form.Select
          name="ID_TIPO_PRO"
          value={formProd.ID_TIPO_PRO}
          onChange={handleChange}
        >
          <option value="">Seleccionar tipo</option>
          {tiposProducto.map(tipo => (
            <option key={tipo.ID_TIPO_PRO} value={tipo.ID_TIPO_PRO}>
              {tipo.NOMBRE}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {[
        { label: "Nombre", key: "NOMBRE" },
        { label: "Precio", key: "PRECIO" },
        { label: "Descripción", key: "DESCRIPCION" },
        { label: "Imagen URL", key: "IMAGEN_URL" },
        { label: "Nota Actual", key: "NOTA_ACTUAL" },
        { label: "Advertencia", key: "ADVERTENCIA" },
      ].map(({ label, key }) => (
        <Form.Group className="mb-3" key={key}>
          <Form.Label>{label}</Form.Label>
          <Form.Control
            type="text"
            name={key}
            value={formProd[key] ?? ""}
            onChange={handleChange}
          />
        </Form.Group>
      ))}
    </>
  );

  return (
    <Container className="mt-4">
      <h2>Gestión de Productos</h2>
 {/* Export Buttons */}
  <div className="mb-3">
    <Button
      variant="outline-primary"
      className="me-2"
      onClick={() => window.open(`http://localhost:5001/api/export/pdf`)}
    >
      Exportar PDF
    </Button>

    <Button
      variant="outline-success"
      onClick={() => window.open(`http://localhost:5001/api/export/excel`)}
    >
      Exportar Excel
    </Button>
  </div>
      <Button variant="success" className="mb-3" onClick={openInsertModal}>
        Agregar Nuevo Producto
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>TIPO</th>
            <th>NOMBRE</th>
            <th>PRECIO</th>
            <th>DESCRIPCIÓN</th>
            <th>NOTA</th>
            <th>IMAGEN</th>
            <th>ADVERTENCIA</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => (
            <tr key={prod.ID_PRODUCTO}>
              <td>{prod.NOMBRE_TIPO_PRO}</td>
              <td>{prod.NOMBRE_PROD}</td>
              <td>{prod.PRECIO}</td>
              <td>{prod.DESCRIPCION}</td>
              <td>{prod.NOTA_ACTUAL}</td>
              <td>{prod.IMAGEN_URL}</td>
              <td>{prod.ADVERTENCIA}</td>
              <td className="container-buttons-product">
                <Button variant="warning" size="sm" onClick={() => openEditModal(prod)} className="me-2">
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(prod.ID_PRODUCTO)} className="me-2">
                  Eliminar
                </Button>
                <Button variant="info" size="sm" onClick={() => navigate(`/crud_rece/${prod.ID_PRODUCTO}`)}>
                  Ver
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Insertar */}
      <Modal show={showInsertModal} onHide={closeModals}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Producto</Modal.Title>
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
          <Modal.Title>Editar Producto</Modal.Title>
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
};
