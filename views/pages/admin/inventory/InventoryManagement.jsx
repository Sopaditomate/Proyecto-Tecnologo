import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Button, Modal, Form } from 'react-bootstrap';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [rawMaterialTypes, setRawMaterialTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRawMaterial, setNewRawMaterial] = useState({
    nombre: '',
    tipoMateria: '',
    unidad: '',
    cantidad: 0,
    descripcion: '',
    idAdministrador: 100001, // Reemplazado
  });

  useEffect(() => {
    fetchInventory();
    fetchRawMaterialTypes();
    fetchUnits();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory');
      setInventory(response.data);
    } catch (error) {
      console.error('Error al obtener el inventario:', error);
    }
  };

  const fetchRawMaterialTypes = async () => {
    try {
      const response = await axios.get('/api/inventory/tipos');
      setRawMaterialTypes(response.data);
    } catch (error) {
      console.error('Error al obtener los tipos de materia prima:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get('/api/inventory/unidades');
      setUnits(response.data);
    } catch (error) {
      console.error('Error al obtener las unidades:', error);
    }
  };

  const handleAddNewRawMaterial = async () => {
    try {
      await axios.post('/api/inventory/nuevo', newRawMaterial);
      setShowModal(false);
      setNewRawMaterial({
        nombre: '',
        tipoMateria: '',
        unidad: '',
        cantidad: 0,
        descripcion: '',
        idAdministrador: 100001,
      });
      fetchInventory();
    } catch (error) {
      console.error('Error al agregar nuevo insumo:', error);
    }
  };

  const handleUpdateQuantity = async (id, cantidad) => {
    try {
      await axios.put(`/api/inventory/${id}`, { cantidad });
      fetchInventory();
    } catch (error) {
      console.error('Error al actualizar la cantidad:', error);
    }
  };

  const handleDeleteInventory = async (id) => {
    try {
      await axios.delete(`/api/inventory/${id}`);
      fetchInventory();
    } catch (error) {
      console.error('Error al eliminar el inventario:', error);
    }
  };

  return (
    <Container>
      <h1>Gestión de Inventario</h1>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Agregar Nuevo Insumo
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Materia Prima</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(inventory) && inventory.length > 0 ? (
            inventory.map((item) => (
              <tr key={item.ID_INVENTARIO}>
                <td>{item.ID_INVENTARIO}</td>
                <td>{item.MATERIA_PRIMA}</td>
                <td>
                  <input
                    type="number"
                    value={item.CANTIDAD}
                    onChange={(e) => handleUpdateQuantity(item.ID_INVENTARIO, Number(e.target.value))}
                  />
                </td>
                <td>{item.UNIDAD}</td>
                <td>{item.TIPO}</td>
                <td>
                  <Button variant="danger" onClick={() => handleDeleteInventory(item.ID_INVENTARIO)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay elementos en el inventario.</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Insumo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={newRawMaterial.nombre}
                onChange={(e) => setNewRawMaterial({ ...newRawMaterial, nombre: e.target.value })}
              />

            </Form.Group>
            <Form.Group controlId="formTipoMateria">
              <Form.Label>Tipos de Materia Prima</Form.Label>
              <Form.Control
                as="select"
                value={newRawMaterial.tipoMateria}
                onChange={(e) => setNewRawMaterial({ ...newRawMaterial, tipoMateria: e.target.value })}
              >
                <option value="">Seleccionar</option>
                {Array.isArray(rawMaterialTypes) && rawMaterialTypes.map((type) => (
                  <option key={type.ID_TIP_MATERIA} value={type.ID_TIP_MATERIA}>
                    {type.NOMBRE}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formUnidad">
              <Form.Label>Unidad</Form.Label>
              <Form.Control
                as="select"
                value={newRawMaterial.unidad}
                onChange={(e) => setNewRawMaterial({ ...newRawMaterial, unidad: e.target.value })}
              >
                <option value="">Seleccionar</option>
                {Array.isArray(units) && units.length > 0 && units.map((unit) => (
                  <option key={unit.ID_UNIDAD} value={unit.ID_UNIDAD}>
                    {unit.NOMBRE}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formCantidad">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                value={newRawMaterial.cantidad}
                onChange={(e) => setNewRawMaterial({ ...newRawMaterial, cantidad: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formDescripcion">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                value={newRawMaterial.descripcion}
                onChange={(e) => setNewRawMaterial({ ...newRawMaterial, descripcion: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddNewRawMaterial}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InventoryManagement;
