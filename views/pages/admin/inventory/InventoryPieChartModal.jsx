// components/InventoryPieChartModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const InventoryPieChartModal = () => {
  const [show, setShow] = useState(false);
  const [unitType, setUnitType] = useState(1); // por ejemplo 1 = Kilogramos
  const [chartData, setChartData] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const fetchData = async (unitId) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/grafica/${unitId}`);
      const data = response.data;

      // Agrupar por tipo de materia prima
      const grouped = {};
      data.forEach(item => {
        const name = item.raw_material;
        grouped[name] = (grouped[name] || 0) + item.quantity;
      });

      // Preparar para la gráfica
      const labels = Object.keys(grouped);
      const values = Object.values(grouped);
      const colors = labels.map((_, i) => `hsl(${i * 50}, 70%, 60%)`);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Cantidad por materia prima',
            data: values,
            backgroundColor: colors,
          },
        ],
      });
    } catch (error) {
      console.error('Error al obtener datos para la gráfica:', error);
    }
  };

  // Cargar al abrir el modal o al cambiar unidad
  useEffect(() => {
    if (show) {
      fetchData(unitType);
    }
  }, [show, unitType]);

  return (
    <>
      <Button variant="outline-info" onClick={handleShow}>
        Ver gráfica de inventario
      </Button>

      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Gráfica por unidad de medida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="unitTypeSelect" className="mb-3">
            <Form.Label>Selecciona la unidad de medida:</Form.Label>
            <Form.Select
              value={unitType}
              onChange={(e) => setUnitType(Number(e.target.value))}
            >
              <option value={1}>Kilogramos</option>
              <option value={2}>Litros</option>
              <option value={3}>Unidades</option>
              {/* Añade más si tienes más unidades */}
            </Form.Select>
          </Form.Group>

          {chartData ? (
            <Pie data={chartData} />
          ) : (
            <p>Cargando datos...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InventoryPieChartModal;
