import { Modal, Form, Alert, Button } from "react-bootstrap";

const ProductModals = ({
  showInsertModal,
  showEditModal,
  showCartModal,
  closeModals,
  handleInsert,
  handleUpdate,
  handleAddToCart,
  renderFormFields,
  formCartProd,
  setFormCartProd,
  editProd,
}) => (
  <>
    {/* Modal Insertar */}
    <Modal
      show={showInsertModal}
      onHide={closeModals}
      size="lg"
      centered
      data-modal="insert"
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Nuevo Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-3">
          Complete la información del nuevo producto. Los campos nombre y precio
          son obligatorios.
        </Alert>
        <Form onSubmit={handleInsert}>
          {renderFormFields()}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button type="submit" variant="primary">
              Crear Producto
            </Button>
            <Button type="button" variant="secondary" onClick={closeModals}>
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
      size="lg"
      centered
      data-modal="edit"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto: {editProd?.NOMBRE_PROD}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="mb-3">
          Está editando el producto "<strong>{editProd?.NOMBRE_PROD}</strong>
          ". Los cambios se aplicarán inmediatamente.
        </Alert>
        <Form onSubmit={handleUpdate}>
          {renderFormFields()}
          <div
            className="d-flex gap-2 justify-content-end mt-4"
            id="modal-buttons"
          >
            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
            <Button type="button" variant="secondary" onClick={closeModals}>
              Cancelar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>

    {/* Modal Agregar al Carrito */}
    <Modal show={showCartModal} onHide={closeModals} centered data-modal="cart">
      <Modal.Header closeButton>
        <Modal.Title>Agregar al Carrito</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="success" className="mb-3">
          Agregando producto al carrito con descuento especial.
        </Alert>
        <Form onSubmit={handleAddToCart}>
          <Form.Group className="mb-3">
            <Form.Label>Descuento (%)</Form.Label>
            <Form.Control
              type="number"
              name="discount"
              value={formCartProd.discount}
              onChange={(e) =>
                setFormCartProd((prev) => ({
                  ...prev,
                  discount: e.target.value,
                }))
              }
              placeholder="Ingrese el porcentaje de descuento"
              min="0"
              max="100"
              step="0.01"
            />
            <Form.Text className="text-muted">
              Ingrese un valor entre 0 y 100 para el descuento
            </Form.Text>
          </Form.Group>
          <div className="d-flex gap-2 justify-content-end">
            <Button type="submit" variant="primary">
              Agregar al Carrito
            </Button>
            <Button type="button" variant="secondary" onClick={closeModals}>
              Cancelar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  </>
);

export default ProductModals;
