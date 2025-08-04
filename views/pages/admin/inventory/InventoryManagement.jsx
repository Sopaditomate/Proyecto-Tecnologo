"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableContainer from "../../../components/table-components/TableContainer";
import DataTable from "../../../components/table-components/DataTable";
import ExpandableText from "../../../components/table-components/ExpandableText";
import "../../../components/table-components/table-components.css";

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [unidades, setUnidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInsumo, setCurrentInsumo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [historialFilter, setHistorialFilter] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [historialCurrentPage, setHistorialCurrentPage] = useState(1);
  const historialItemsPerPage = 5;

  useEffect(() => {
    fetchInventory();
    fetchUnidades();
    fetchTipos();
  }, []);

  // Efecto para filtrar cuando cambian los criterios
  useEffect(() => {
    filterInventory();
  }, [searchTerm, selectedType, inventory]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:44070/api/inventario/");
      setInventory(response.data);
      setFilteredInventory(response.data);
    } catch (error) {
      console.error("Error al obtener el inventario:", error);
      toast.error("No se pudo cargar el inventario. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnidades = async () => {
    try {
      const response = await axios.get(
        "http://localhost:44070/api/inventario/unidades"
      );
      setUnidades(response.data);
    } catch (error) {
      console.error("Error al obtener las unidades:", error);
    }
  };

  const fetchTipos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:44070/api/inventario/tipos"
      );
      setTipos(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos:", error);
    }
  };

  const fetchHistorial = async () => {
    try {
      const response = await axios.get(
        "http://localhost:44070/api/inventario/historial"
      );
      setHistorial(response.data);
    } catch (error) {
      console.error("Error al obtener el historial:", error);
    }
  };

  // Función para filtrar inventario
  const filterInventory = () => {
    let filtered = inventory;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.MATERIA_PRIMA?.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          item.UNIDAD?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.TIPO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.DESCRIPCION?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.CANTIDAD?.toString().includes(searchTerm)
      );
    }

    // Filtrar por tipo
    if (selectedType && selectedType !== "Todos") {
      filtered = filtered.filter((item) => item.TIPO === selectedType);
    }

    setFilteredInventory(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Configuración de columnas para inventario
  const inventoryColumns = [
    {
      Header: "Materia Prima",
      accessor: "MATERIA_PRIMA",
      headerStyle: { width: "100px" },
      Cell: ({ value }) => <strong>{value}</strong>,
    },
    {
      Header: "Cantidad",
      accessor: "CANTIDAD",
      headerStyle: { width: "100px" },
      Cell: ({ value }) => <span>{value}</span>,
    },
    {
      Header: "Unidad",
      accessor: "UNIDAD",
      headerStyle: { width: "100px" },
      Cell: ({ value }) => <span>{value}</span>,
    },
    {
      Header: "Tipo",
      accessor: "TIPO",
      headerStyle: { width: "150px" },
      Cell: ({ value }) => <span>{value}</span>,
    },
    {
      Header: "Descripción",
      accessor: "DESCRIPCION",
      headerStyle: { width: "200px" },
      Cell: ({ value }) => <ExpandableText text={value} maxLines={2} />,
    },
    {
      Header: "Acciones",
      headerStyle: { width: "0px" },
      Cell: ({ row }) => (
        <div
          className="d-flex gap-2"
          style={{ justifyContent: "space-around" }}
        >
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleEdit(row.original)}
            className="action-btn"
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row.original.ID_INVENTARIO)}
            className="action-btn"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  // Configuración de columnas para historial
  const historialColumns = [
    {
      Header: "Materia",
      accessor: "NOMBRE_MATERIA",
    },
    {
      Header: "Cantidad",
      accessor: "CANTIDAD",
    },
    {
      Header: "Tipo de Movimiento",
      accessor: "TIPO_MOVIMIENTO",
      Cell: ({ value }) => (
        <span
          className={`badge ${
            value === "ENTRADA" ? "bg-success" : "bg-warning"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      Header: "Fecha de Movimiento",
      accessor: "FECHA_MOVIMIENTO",
      Cell: ({ value }) => new Date(value).toLocaleString(),
    },
  ];

  const [showModal, setShowModal] = useState(false);
  const [nuevoInsumo, setNuevoInsumo] = useState({
    MATERIA_PRIMA: "",
    CANTIDAD: "",
    UNIDAD: "",
    TIPO: "",
    DESCRIPCION: "",
    ID_ADMINISTRADOR: 700002,
  });

  const handleShowModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentInsumo(null);
    setNuevoInsumo({
      MATERIA_PRIMA: "",
      CANTIDAD: "",
      UNIDAD: "",
      TIPO: "",
      DESCRIPCION: "",
      ID_ADMINISTRADOR: 700002,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoInsumo((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (insumo) => {
    setCurrentInsumo(insumo);
    setNuevoInsumo({
      MATERIA_PRIMA: insumo.MATERIA_PRIMA,
      CANTIDAD: insumo.CANTIDAD,
      UNIDAD: insumo.ID_UNIDAD,
      TIPO: insumo.ID_TIP_MATERIA,
      DESCRIPCION: insumo.DESCRIPCION,
      ID_ADMINISTRADOR: 700002,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const {
        MATERIA_PRIMA,
        CANTIDAD,
        UNIDAD,
        TIPO,
        DESCRIPCION,
        ID_ADMINISTRADOR,
      } = nuevoInsumo;

      if (isEditing) {
        await axios.put(
          `http://localhost:44070/api/inventario/${currentInsumo.ID_INVENTARIO}`,
          {
            nombre: MATERIA_PRIMA,
            id_tipo_materia: TIPO,
            id_unidad: UNIDAD,
            cantidad: CANTIDAD,
            descripcion: DESCRIPCION,
          }
        );
        toast.success("Insumo actualizado con éxito!");
      } else {
        await axios.post("http://localhost:44070/api/inventario/nuevo", {
          nombre: MATERIA_PRIMA,
          tipoMateria: TIPO,
          unidad: UNIDAD,
          cantidad: CANTIDAD,
          descripcion: DESCRIPCION,
          idAdministrador: ID_ADMINISTRADOR,
        });
        toast.success("Insumo agregado con éxito!");
      }

      fetchInventory();
      handleCloseModal();
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar el insumo:", error);
      toast.error("Error al guardar los cambios.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este insumo?")) {
      try {
        await axios.delete(`http://localhost:44070/api/inventario/${id}`);
        fetchInventory();
        toast.success("Insumo eliminado con éxito!");
      } catch (error) {
        console.error("Error al eliminar el insumo:", error);
        toast.error("Error al eliminar el insumo. Intenta nuevamente.");
      }
    }
  };

  const handleShowHistorialModal = () => {
    fetchHistorial();
    setShowHistorialModal(true);
  };

  const handleCloseHistorialModal = () => {
    setShowHistorialModal(false);
    setHistorialCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
  };

  const handleUploadChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      toast.error("El archivo debe ser un CSV válido.");
      setCsvFile(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      toast.error("Por favor, selecciona un archivo CSV.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await axios.post(
        "http://localhost:44070/api/inventario/cargar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Carga masiva completada con éxito!");
      fetchInventory();
      handleCloseUploadModal();
    } catch (error) {
      console.error("Error al cargar el archivo:", error);

      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Error al cargar el archivo. Intenta nuevamente.");
      }
    }
  };

  const handleShowUploadModal = () => setShowUploadModal(true);
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setCsvFile(null);
  };

  // Filtrar historial
  const filteredHistorial = historial.filter(
    (item) =>
      !historialFilter ||
      item.NOMBRE_MATERIA?.toLowerCase().includes(
        historialFilter.toLowerCase()
      ) ||
      item.TIPO_MOVIMIENTO?.toLowerCase().includes(
        historialFilter.toLowerCase()
      )
  );

  // Paginación
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const paginatedHistorial = filteredHistorial.slice(
    (historialCurrentPage - 1) * historialItemsPerPage,
    historialCurrentPage * historialItemsPerPage
  );
  const historialTotalPages = Math.ceil(
    filteredHistorial.length / historialItemsPerPage
  );

  // Extraer tipos únicos para el filtro
  const tiposUnicos = [...new Set(inventory.map((item) => item.TIPO))].filter(
    Boolean
  );

  return (
    <>
      <ToastContainer />

      <TableContainer
        title="Gestión de Inventario"
        subtitle="Administra las materias primas y suministros de la panadería"
        // Search and filter props
        searchLabel="Buscar en Inventario"
        searchPlaceholder="Buscar por materia prima, unidad, tipo o descripción..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterLabel="Filtrar por Tipo"
        filterValue={selectedType}
        onFilterChange={setSelectedType}
        filterOptions={tiposUnicos}
        // Actions
        onClear={handleClearFilters}
        onAdd={handleShowModal}
        onHistory={handleShowHistorialModal}
        onUpload={handleShowUploadModal}
        addLabel="Agregar Insumo"
        historyLabel="Ver Historial"
        uploadLabel="Cargar CSV"
        showHistory={true}
        showUpload={true}
        // Export options
        exportOptions={[
          {
            label: "PDF",
            onClick: () =>
              window.open(
                "http://localhost:44070/api/export/pdfinventario",
                "_blank"
              ),
            variant: "outline-danger",
          },
          {
            label: "Excel",
            onClick: () =>
              window.open(
                "http://localhost:44070/api/export/excelinventario",
                "_blank"
              ),
            variant: "outline-success",
          },
        ]}
        // Table props
        columns={inventoryColumns}
        data={paginatedInventory}
        loading={loading}
        emptyMessage={
          searchTerm || selectedType
            ? "No se encontraron insumos con los criterios de búsqueda"
            : "No hay insumos en el inventario"
        }
        // Pagination props
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredInventory.length}
        itemsPerPage={itemsPerPage}
      />

      {/* Modal para agregar/editar insumo */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Editar Insumo" : "Agregar Nuevo Insumo"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Materia Prima</Form.Label>
              <Form.Control
                type="text"
                name="MATERIA_PRIMA"
                value={nuevoInsumo.MATERIA_PRIMA}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                name="CANTIDAD"
                value={nuevoInsumo.CANTIDAD}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unidad</Form.Label>
              <Form.Control
                as="select"
                name="UNIDAD"
                value={nuevoInsumo.UNIDAD}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una unidad</option>
                {unidades.map((unidad) => (
                  <option key={unidad.ID_UNIDAD} value={unidad.ID_UNIDAD}>
                    {unidad.NOMBRE}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Control
                as="select"
                name="TIPO"
                value={nuevoInsumo.TIPO}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un tipo</option>
                {tipos.map((tipo) => (
                  <option key={tipo.ID_TIP_MATERIA} value={tipo.ID_TIP_MATERIA}>
                    {tipo.NOMBRE}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="DESCRIPCION"
                value={nuevoInsumo.DESCRIPCION}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal del historial */}
      <Modal
        size="lg"
        show={showHistorialModal}
        onHide={handleCloseHistorialModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Historial de Inventario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder="Buscar en historial..."
              value={historialFilter}
              onChange={(e) => setHistorialFilter(e.target.value)}
            />
          </div>

          <DataTable
            columns={historialColumns}
            data={paginatedHistorial}
            loading={false}
            emptyMessage="No hay registros en el historial"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseHistorialModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para carga masiva */}
      <Modal show={showUploadModal} onHide={handleCloseUploadModal}>
        <Modal.Header closeButton>
          <Modal.Title>Carga Masiva de Inventario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUploadSubmit}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Selecciona el archivo CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={handleUploadChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseUploadModal}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Cargar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default InventoryManagement;
