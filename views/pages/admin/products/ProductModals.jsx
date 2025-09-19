"use client";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const ProductModals = ({
  showInsertModal,
  showEditModal,
  showCartModal,
  closeModals,
  handleInsert,
  handleUpdate,
  handleAddToCart,
  formProd,
  handleChange,
  formCartProd,
  setFormCartProd,
  editProd,
  tiposProducto,
}) => {
  
  // Function to format price with a dot as a thousands separator
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      minimumFractionDigits: 2,  // Keep 2 decimal places
      maximumFractionDigits: 2,  // Keep 2 decimal places
    }).format(price).replace(/,/g, '.');  // Replace commas with dots
  };

  const renderFormFields = () => (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo de Producto</Form.Label>
            <Form.Select
              name="ID_TIPO_PRO"
              value={formProd.ID_TIPO_PRO}
              onChange={handleChange}
            >
              <option value="">Seleccionar tipo de producto</option>
              {tiposProducto.map((tipo) => (
                <option key={tipo.ID_TIPO_PRO} value={tipo.ID_TIPO_PRO}>
                  {tipo.NOMBRE}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Producto</Form.Label>
            <Form.Control
              type="text"
              name="NOMBRE"
              value={formProd.NOMBRE ?? ""}
              onChange={handleChange}
              placeholder="Ej: Pan Integral Artesanal"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Precio ($)</Form.Label>
            <Form.Control
              type="number"
              name="PRECIO"
              value={formProd.PRECIO ?? ""}
              onChange={handleChange}
              placeholder="Ej: 15000"
              min="1"
              step="1"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              type="text"
              name="DESCRIPCION"
              value={formProd.DESCRIPCION ?? ""}
              onChange={handleChange}
              placeholder="Describe las características del producto"
              className="description-input"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>URL de la Imagen</Form.Label>
            <Form.Control
              type="text"
              name="IMAGEN_URL"
              value={formProd.IMAGEN_URL ?? ""}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nota Actual</Form.Label>
            <Form.Control
              type="text"
              name="NOTA_ACTUAL"
              value={formProd.NOTA_ACTUAL ?? ""}
              onChange={handleChange}
              placeholder="Notas adicionales sobre el producto"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Advertencia</Form.Label>
            <Form.Control
              type="text"
              name="ADVERTENCIA"
              value={formProd.ADVERTENCIA ?? ""}
              onChange={handleChange}
              placeholder="Advertencias o alergenos"
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  return (
    <>
      {/* Modal para insertar producto */}
      <Modal show={showInsertModal} onHide={closeModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleInsert}>
            {renderFormFields()}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeModals}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Crear Producto
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para editar producto */}
      <Modal show={showEditModal} onHide={closeModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            {renderFormFields()}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeModals}>
                Cancelar
              </Button>
              <Button variant="warning" type="submit">
                Actualizar Producto
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para agregar al carrito */}
      <Modal show={showCartModal} onHide={closeModals}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar al Carrito</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddToCart}>
            <Form.Group className="mb-3">
              <Form.Label>Descuento (%)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingresa el descuento"
                value={formCartProd.discount}
                onChange={(e) =>
                  setFormCartProd({ ...formCartProd, discount: e.target.value })
                }
                min="0"
                max="100"
                required
              />
              <Form.Text className="text-muted">
                Ingresa un porcentaje de descuento para este producto
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeModals}>
                Cancelar
              </Button>
              <Button variant="success" type="submit">
                Agregar al Carrito
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductModals;
