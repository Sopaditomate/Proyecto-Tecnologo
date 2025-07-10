import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Modal, Button, Form } from 'react-bootstrap';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './inventory.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [unidades, setUnidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInsumo, setCurrentInsumo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [historialFilter, setHistorialFilter] = useState('');
  const [noResults, setNoResults] = useState(false); // Estado para manejar resultados
  const [showUploadModal, setShowUploadModal] = useState(false); // Estado para el modal de carga

  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    fetchInventory();
    fetchUnidades();
    fetchTipos();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/inventario/');
      setInventory(response.data);
    } catch (error) {
      console.error('Error al obtener el inventario:', error);
      toast.error('No se pudo cargar el inventario. Intenta nuevamente.');
    }
  };

  const fetchUnidades = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/inventario/unidades');
      setUnidades(response.data);
    } catch (error) {
      console.error('Error al obtener las unidades:', error);
    }
  };

  const fetchTipos = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/inventario/tipos');
      setTipos(response.data);
    } catch (error) {
      console.error('Error al obtener los tipos:', error);
    }
  };

  //prueba de historial
  const fetchHistorial = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/inventario/historial');
      setHistorial(response.data);
    } catch (error) {
      console.error('Error al obtener el historial:', error);
    }
  };


  const columns = React.useMemo(() => [
    // {
    //   Header: 'ID Inventario',
    //   accessor: 'ID_INVENTARIO',
    // },
    {
      Header: 'Materia Prima',
      accessor: 'MATERIA_PRIMA',
    },
    {
      Header: 'Cantidad',
      accessor: 'CANTIDAD',
    },
    {
      Header: 'Unidad',
      accessor: 'UNIDAD',
    },
    {
      Header: 'Tipo',
      accessor: 'TIPO',
    },
    {
      Header: 'Descripción', // Agregar columna para descripción
      accessor: 'DESCRIPCION',
    },
    {
      Header: 'Acciones',
      Cell: ({ row }) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Button
            variant="warning"
            style={{ flex: 1, marginBottom: '10px' }} // Espacio entre botones
            onClick={() => handleEdit(row.original)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            style={{ flex: 1 }} // Asegura que ambos botones tengan el mismo tamaño
            onClick={() => handleDelete(row.original.ID_INVENTARIO)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ], []);



  const historialColumns = React.useMemo(() => [
    // {
    //   Header: 'ID Historial',
    //   accessor: 'ID_HYS_INVENTARIO',
    // },
    {
      Header: 'Materia',
      accessor: 'NOMBRE_MATERIA',
    },
    {
      Header: 'Cantidad',
      accessor: 'CANTIDAD',
    },
    {
      Header: 'Tipo de Movimiento',
      accessor: 'TIPO_MOVIMIENTO',
    },
    {
      Header: 'Fecha de Movimiento',
      accessor: 'FECHA_MOVIMIENTO',
      Cell: ({ value }) => new Date(value).toLocaleString(), // Formatear la fecha
    },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    state: { pageIndex, pageSize },
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    setPageSize,
    setGlobalFilter: setTableGlobalFilter,
  } = useTable({
    columns,
    data: inventory,
    initialState: { pageIndex: 0, pageSize: 5 },
  }, useGlobalFilter, usePagination);


  const {
    getTableProps: getHistorialTableProps,
    getTableBodyProps: getHistorialTableBodyProps,
    headerGroups: historialHeaderGroups,
    prepareRow: prepareHistorialRow,
    page: historialPage,
    state: { pageIndex: historialPageIndex, pageSize: historialPageSize },
    canPreviousPage: canHistorialPreviousPage,
    canNextPage: canHistorialNextPage,
    pageOptions: historialPageOptions,
    gotoPage: gotoHistorialPage,
    setPageSize: setHistorialPageSize,
    setGlobalFilter: setHistorialGlobalFilter,
  } = useTable({
    columns: historialColumns,
    data: historial,
    initialState: { pageIndex: 0, pageSize: 5 },
    globalFilter: historialFilter,
  }, useGlobalFilter, usePagination);


  // UseEffect para la tabla de inventario
  useEffect(() => {
    setTableGlobalFilter(globalFilter);
  }, [globalFilter, setTableGlobalFilter]);

  // UseEffect para la tabla de historial
  useEffect(() => {
    setHistorialGlobalFilter(historialFilter); // Cambia esto
  }, [historialFilter, setHistorialGlobalFilter]);

  const [showModal, setShowModal] = useState(false);
  const [nuevoInsumo, setNuevoInsumo] = useState({
    MATERIA_PRIMA: '',
    CANTIDAD: '',
    UNIDAD: '',
    TIPO: '',
    DESCRIPCION: '',
    ID_ADMINISTRADOR: 700002, // admin actual, hay que dudar si hacerlo dinamico
  });

  const handleShowModal = () => setShowModal(true);
  //para que se limpie el formulario cada vez que se cierra
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentInsumo(null);
    setNuevoInsumo({
      MATERIA_PRIMA: '',
      CANTIDAD: '',
      UNIDAD: '',
      TIPO: '',
      DESCRIPCION: '',
      ID_ADMINISTRADOR: 700002,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoInsumo((prev) => ({ ...prev, [name]: value }));
  };
  //para editar
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
      const { MATERIA_PRIMA, CANTIDAD, UNIDAD, TIPO, DESCRIPCION, ID_ADMINISTRADOR } = nuevoInsumo;

      if (isEditing) {
        //si o si, al usar axios deben ser iguales a los parametros del controlador, esots estan bien:
        // Lógica para actualizar el insumo
        await axios.put(`http://localhost:5001/api/inventario/${currentInsumo.ID_INVENTARIO}`, {
          nombre: MATERIA_PRIMA,
          id_tipo_materia: TIPO,
          id_unidad: UNIDAD,
          cantidad: CANTIDAD,
          descripcion: DESCRIPCION,
        });
        toast.success('Insumo actualizado con éxito!'); // Alerta de éxito
      } else {
        //los parametros estan bien, por favor no tocar
        // Lógica para agregar un nuevo insumo
        await axios.post('http://localhost:5001/api/inventario/nuevo', {
          nombre: MATERIA_PRIMA,
          tipoMateria: TIPO,
          unidad: UNIDAD,
          cantidad: CANTIDAD,
          descripcion: DESCRIPCION,
          idAdministrador: ID_ADMINISTRADOR,
        });
        toast.success('Insumo agregado con éxito!'); // Alerta de éxito
      }

      fetchInventory(); // Recarga la tabla
      handleCloseModal(); // Cierra el modal
      setIsEditing(false); // Resetea el estado de edición
    } catch (error) {
      console.error('Error al guardar el insumo:', error);
      toast.error('Error al guardar los cambios.'); // Alerta de error
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este insumo?')) {
      try {
        await axios.delete(`http://localhost:5001/api/inventario/${id}`);
        fetchInventory(); // Recarga la tabla después de eliminar
        toast.success('Insumo eliminado con éxito!'); // Alerta de éxito
      } catch (error) {
        console.error('Error al eliminar el insumo:', error);
        toast.error('Error al eliminar el insumo. Intenta nuevamente.'); // Alerta de error
      }
    }
  };

  const handleShowHistorialModal = () => {
    fetchHistorial(); // Carga el historial antes de mostrar el modal
    setShowHistorialModal(true);
  };

  const handleCloseHistorialModal = () => setShowHistorialModal(false);

  //para la barra de busqueda:
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setGlobalFilter(value);

    // Verifica si hay coincidencias en todos los campos
    const results = inventory.filter(item =>
      item.MATERIA_PRIMA.toLowerCase().includes(value) ||
      item.UNIDAD.toLowerCase().includes(value) ||
      item.TIPO.toLowerCase().includes(value) ||
      item.DESCRIPCION.toLowerCase().includes(value) ||
      item.CANTIDAD.toString().includes(value)
    );

    // Solo muestra el mensaje de error si no hay resultados
    setNoResults(results.length === 0 && value !== '');
  };

  const handleUploadChange = (e) => {
    setCsvFile(e.target.files[0]);
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
    toast.error('Por favor, selecciona un archivo CSV.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', csvFile); // Campo debe coincidir con el que espera el backend

    const response = await axios.post('http://localhost:5001/api/inventario/cargar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Carga masiva completada con éxito!');
    fetchInventory(); // Recargar inventario actualizado
    handleCloseUploadModal(); // Cerrar modal de carga

  } catch (error) {
    console.error('Error al cargar el archivo:', error);

    if (error.response?.data?.message) {
      toast.error(`Error: ${error.response.data.message}`);
    } else {
      toast.error('Error al cargar el archivo. Intenta nuevamente.');
    }
  }
};

  const handleShowUploadModal = () => setShowUploadModal(true);
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setCsvFile(null); // Limpiar el archivo seleccionado
  };

  return (
    <Container>
      <ToastContainer />
      <br /><br />
      <h1 className="text-3xl font-bold text-center text-brown-700 my-6">Gestión de Inventario</h1>
      <br />
      <div className="Cont-Butt">
        <Button
          onClick={handleShowHistorialModal}
          className="custom-button"
        >
          Ver Historial
        </Button>

        <Button
          onClick={handleShowModal}
          className="custom-button" // Clase personalizada para el botón
        >
          Agregar Insumo
        </Button>
        <Button onClick={handleShowUploadModal} className="custom-button">
          Cargar CSV
        </Button>

      </div>
      <div className="Cont-Butt">
        <Button
          variant="outline-primary"
          className="me-2"
          onClick={() => window.open('http://localhost:5001/api/export/pdfinventario', '_blank')}
        >
          Exportar PDF
        </Button>

        <Button
          variant="outline-success"
          onClick={() => window.open('http://localhost:5001/api/export/excelinventario', '_blank')}
        >
          Exportar Excel
        </Button>
      </div>





      <div className="mb-2">
        <label htmlFor="pageSize" className="form-label">Entradas por página:</label>
        <br />
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-4 py-2 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              Mostrar {size}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label htmlFor="search" className="form-label">Buscar: </label>
        <div className="input-group">
          <input
            type="text"
            id="search"
            value={globalFilter || ''}
            onChange={handleSearchChange}
            className="form-control"
          />
          {globalFilter && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setGlobalFilter('')}
            >
              &times;
            </button>
          )}
        </div>
        {noResults && <div className="text-danger mt-2">Sin coincidencias encontradas</div>}
      </div>


      <div className="table-responsive justify-content-center" style={{ maxWidth: '1300px', margin: '2rem auto', width: '100%' }}>
        <table {...getTableProps()} className="Custom">
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index} className="bg-gray-100">
                {headerGroup.headers.map((column, idx) => (
                  <th {...column.getHeaderProps()} key={idx} className="px-4 py-2 text-left font-semibold text-gray-700">
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id} className="border-b hover:bg-gray-100 transition-colors">
                  {row.cells.map((cell, j) => (
                    <td {...cell.getCellProps()} key={j} className="px-4 py-2 text-gray-800">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination-container flex justify-center items-center space-x-2 mt-4">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:opacity-50">
          {'<<'}
        </button>
        <button onClick={() => gotoPage(pageIndex - 1)} disabled={!canPreviousPage} className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:opacity-50">
          {'<'}
        </button>
        <span>
          Página {pageIndex + 1} de {pageOptions.length}
        </span>
        <button onClick={() => gotoPage(pageIndex + 1)} disabled={!canNextPage} className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:opacity-50">
          {'>'}
        </button>
        <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage} className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:opacity-50">
          {'>>'}
        </button>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Insumo' : 'Agregar Nuevo Insumo'}</Modal.Title>
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

            <div className="d-flex justify-content-end">
              <Button variant="primary" type="submit">
                Guardar
              </Button>
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/*Modal de el historial*/}
      <Modal className="tableTail" show={showHistorialModal} onHide={handleCloseHistorialModal}>
        <Modal.Header closeButton>
          <Modal.Title>Historial de Inventario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Buscar..."
            onChange={(e) => setHistorialFilter(e.target.value)}
            className="w-48 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Select para controlar el tamaño de página */}
          <div className="my-2">
            <select
              value={historialPageSize}
              onChange={(e) => setHistorialPageSize(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              {[5, 10, 20].map((size) => (
                <option key={size} value={size}>
                  Mostrar {size}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table {...getHistorialTableProps()} className="Custom">
              <thead>
                {historialHeaderGroups.map((headerGroup, index) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={index} className="bg-gray-100">
                    {headerGroup.headers.map((column, idx) => (
                      <th {...column.getHeaderProps()} key={idx} className="px-4 py-2 text-left font-semibold text-gray-700">
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getHistorialTableBodyProps()}>
                {historialPage.map((row) => {
                  prepareHistorialRow(row);
                  return (
                    <tr {...row.getRowProps()} key={row.id} className="border-b hover:bg-gray-100 transition-colors">
                      {row.cells.map((cell, j) => (
                        <td {...cell.getCellProps()} key={j} className="px-4 py-2 text-gray-800">
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="pagination-container flex justify-center items-center space-x-2 mt-4">
            <button onClick={() => gotoHistorialPage(0)} disabled={!canHistorialPreviousPage} className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:opacity-50">
              {'<<'}
            </button>
            <button onClick={() => gotoHistorialPage(historialPageIndex - 1)} disabled={!canHistorialPreviousPage} className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:opacity-50">
              {'<'}
            </button>
            <span>
              Página {historialPageIndex + 1} de {historialPageOptions.length}
            </span>
            <button onClick={() => gotoHistorialPage(historialPageIndex + 1)} disabled={!canHistorialNextPage} className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:opacity-50">
              {'>'}
            </button>
            <button onClick={() => gotoHistorialPage(historialPageOptions.length - 1)} disabled={!canHistorialNextPage} className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:opacity-50">
              {'>>'}
            </button>
          </div>
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
              <Form.Control type="file" accept=".csv" onChange={handleUploadChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">
              Cargar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>


    </Container>
  );
};

export default InventoryManagement;
