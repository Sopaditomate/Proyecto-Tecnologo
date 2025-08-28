import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableContainer from "../../../components/table-components/TableContainer";
import { Modal, Form, Button } from "react-bootstrap";
import DataTable from "../../../components/table-components/DataTable";
import { useNavigate } from "react-router-dom";

export const AdminProductions = () => {
  const [productions, setProductions] = useState([]);
  const [filteredProductions, setFilteredProductions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statuses, setStatuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [reactivateMode, setReactivateMode] = useState(false);

  // === Historial de Producciones ===
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [historialFilter, setHistorialFilter] = useState("");
  const [historialCurrentPage, setHistorialCurrentPage] = useState(1);
  const historialItemsPerPage = 8;

  const navigate = useNavigate();

  // === Cargar producciones ===
  const fetchProductions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${VITE_API_URL}/produccion/production`);
      setProductions(res.data);
      setFilteredProductions(res.data);
    } catch (err) {
      console.error("Error al obtener producciones:", err);
      toast.error("Error al obtener las producciones activas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchHistorial = async () => {
    try {
      const res = await axios.get(`${VITE_API_URL}/produccion/production/history`);
      setHistorial(res.data);
    } catch (err) {
      console.error("Error al obtener historial:", err);
      toast.error("No se pudo obtener el historial de producciones.");
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

  // === Filtro búsqueda ===
  const filterProductions = () => {
    let result = productions;

    if (searchTerm) {
      result = result.filter((p) => {
        const idMatch = String(p.id_production).includes(searchTerm);
        const statusMatch = p.production_status.toLowerCase().includes(searchTerm.toLowerCase());

        const startDate = new Date(p.start_datetime).toLocaleString("es-ES");
        const endDate = p.end_datetime
          ? new Date(p.end_datetime).toLocaleString("es-ES")
          : "En curso";

        const startMatch = startDate.toLowerCase().includes(searchTerm.toLowerCase());
        const endMatch = endDate.toLowerCase().includes(searchTerm.toLowerCase());

        return idMatch || statusMatch || startMatch || endMatch;
      });
    }

    if (statusFilter) {
      result = result.filter((p) => p.production_status === statusFilter);
    }

    setFilteredProductions(result);
    setCurrentPage(1);
  };

  const filteredHistorial = historial.filter((h) => {
  const term = historialFilter.toLowerCase();
    return (
      String(h.id_historial).includes(term) ||
      String(h.id_produccion).includes(term) ||
      h.nombre_producto.toLowerCase().includes(term) ||
      h.tipo_movimiento.toLowerCase().includes(term) ||
      h.descripcion_movimiento.toLowerCase().includes(term)
    );
  });

  const paginatedHistorial = filteredHistorial.slice(
    (historialCurrentPage - 1) * historialItemsPerPage,
    historialCurrentPage * historialItemsPerPage
  );

  const historialTotalPages = Math.ceil(
    filteredHistorial.length / historialItemsPerPage
  );

  useEffect(() => {
    filterProductions();
  }, [searchTerm, statusFilter, productions]);

  // === Estados ===
  const fetchStatuses = async () => {
    try {
      const res = await axios.get(`${VITE_API_URL}/produccion/production/status`);
      setStatuses(res.data);
    } catch (err) {
      console.error("Error al obtener estados:", err);
      toast.error("Error al obtener los estados de producción.");
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // === Productos disponibles ===
  const fetchAvailableProducts = async () => {
    try {
      const res = await axios.get(`${VITE_API_URL}/produccion/production/recipe`);
      const mappedProducts = res.data.map((p) => ({
        ID_PRODUCTO: p.id_product,
        NOMBRE_PROD: p.name,
      }));
      setAvailableProducts(mappedProducts);
    } catch (err) {
      console.error("Error al obtener productos disponibles:", err);
      toast.error("Error al cargar productos con receta para la nueva producción.");
    }
  };

  const deleteProduction = async (idProduction) => {
    try {
      await axios.delete(`${VITE_API_URL}/produccion/production/${idProduction}`);
      toast.success("Producción eliminada correctamente");
      fetchProductions();
    } catch (error) {
      console.error("Error eliminando producción:", error);
      toast.error("No se pudo eliminar la producción");
    }
  };

  const fetchMaxProducible = async (productId) => {
    try {
      const res = await axios.get(`${VITE_API_URL}/produccion/production/max-production/${productId}`);
      return res.data?.[0]?.max_producible ?? null;
    } catch (err) {
      console.error("Error obteniendo max producible:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const fetchValidation = async (productId, requestedQty) => {
    try {
      const res = await axios.post(`${VITE_API_URL}/produccion/production/validate`, {
        productId,
        requestedQty,
      });
      return res.data;
    } catch (err) {
      console.error("Error validando producción:", err);
      toast.error("Error al validar la producción.");
      return null;
    }
  };

  const handleCreateProduction = async () => {
    if (selectedItems.some(item => Number(item.quantity) <= 0)) {
      toast.warn("La cantidad debe ser mayor a cero.");
      return;
    }

    for (const item of selectedItems) {
      if (!item.validation) {
        toast.warn("Debes validar cada producto antes de crear la producción.");
        return;
      }
      if (!item.validation.canProduce) {
        toast.error(`No puedes producir la cantidad indicada de ${
          availableProducts.find(p => p.ID_PRODUCTO === item.id_product)?.NOMBRE_PROD
        }.`);
        return;
      }
    }

    try {
      const res = await axios.post(`${VITE_API_URL}/produccion/production`, {
        total_products: selectedItems.reduce((acc, i) => acc + Number(i.quantity), 0),
        id_production_status: statuses.length ? statuses[0].id_production_status : null
      });

      const newProductionId = res.data?.data?.id_production;
      if (!newProductionId) throw new Error("ID de producción no recibido desde el backend.");

      for (const item of selectedItems) {
        await axios.post(
          `${VITE_API_URL}/produccion/production/${newProductionId}/add-detail`,
          { id_product: item.id_product, planned_quantity: item.quantity }
        );
      }

      toast.success("Producción creada exitosamente.");
      fetchProductions();
      closeCreateModal();
    } catch (err) {
      console.error("Error creando producción:", err);
      toast.error("No se pudo crear la producción.");
    }
  };

  const handleFinishProduction = async (id_production) => {
    try {
      const statusFinalizado = statuses.find(s => s.name === "Finalizado");
      if (!statusFinalizado) {
        toast.error("No se encontró el estado 'Finalizado'");
        return;
      }

      await axios.put(`${VITE_API_URL}/produccion/production/${id_production}/change-status`, {
        id_production_status: statusFinalizado.id_production_status,
      });

      toast.success("Producción finalizada correctamente.");
      fetchProductions();
    } catch (err) {
      console.error("Error al finalizar producción:", err);
      toast.error("No se pudo finalizar la producción.");
    }
  };

  const handleReactivateProduction = async (id_production) => {
    try {
      const statusEnProduccion = statuses.find(s => s.name === "En Producción");
      if (!statusEnProduccion) {
        toast.error("No se encontró el estado 'En Producción'");
        return;
      }

      await axios.put(`${VITE_API_URL}/produccion/production/${id_production}/change-status`, {
        id_production_status: statusEnProduccion.id_production_status,
      });

      setReactivateMode(true);
      toast.success("Producción reactivada correctamente.");
      fetchProductions();
    } catch (err) {
      console.error("Error al reactivar producción:", err);
      toast.error("No se pudo reactivar la producción.");
    }
  };

  const openCreateModal = () => {
    setSelectedItems([]);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  // === Definición de columnas ===
  const columns = [
    {
      Header: "ID Producción",
      accessor: "id_production",
    },
    {
      Header: "Fecha Inicio",
      accessor: "start_datetime",
      Cell: ({ value }) => new Date(value).toLocaleString("es-ES"),
    },
    {
      Header: "Fecha Fin",
      accessor: "end_datetime",
      Cell: ({ value }) =>
        value ? new Date(value).toLocaleString("es-ES") : "En curso",
    },
    {
      Header: "Total Productos",
      accessor: "total_products",
      Cell: ({ value }) => <strong>{value}</strong>,
    },
    {
      Header: "Estado",
      accessor: "production_status",
      Cell: ({ value }) => {
        const color =
          value === "Finalizado"
            ? "bg-success"
            : value === "En Producción"
            ? "bg-warning text-dark"
            : "bg-secondary";
        return <span className={`badge ${color}`}>{value}</span>;
      },
    },
    {
      Header: "Acciones",
      accessor: "acciones",
      Cell: ({ row }) => {
        const prod = row.original;

        return (
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/productions/${prod.id_production}`)}
            >
              Detalles
            </Button>

            {prod.production_status === "En Producción" && (
              <Button
                size="sm"
                variant="success"
                onClick={() => handleFinishProduction(prod.id_production)}
              >
                Finalizar
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteProduction(prod.id_production)}
            >
              Eliminar
            </Button>

            {prod.production_status === "Finalizado" && reactivateMode && (
              <Button
                size="sm"
                variant="info"
                onClick={() => handleReactivateProduction(prod.id_production)}
              >
                Reactivar Producción
              </Button>
            )}
          </div>
        );
      },
    },
  ];


  const historialColumns = [
    { Header: "ID Historial", accessor: "id_historial" },
    { Header: "ID Producción", accessor: "id_produccion" },
    { Header: "Producto", accessor: "nombre_producto" },
    { Header: "Cantidad", accessor: "cantidad" },
    { Header: "Movimiento", accessor: "tipo_movimiento" },
    { Header: "Descripción", accessor: "descripcion_movimiento" },
    {
      Header: "Fecha Movimiento",
      accessor: "fecha_movimiento",
      Cell: ({ value }) => new Date(value).toLocaleString("es-ES"),
    },
  ];

  // === Paginación ===
  const paginatedData = filteredProductions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProductions.length / itemsPerPage);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  return (
    <>
      <ToastContainer />

      <TableContainer
        title="Gestión de Producción"
        subtitle="Producciones activas en el sistema"
        searchLabel="Buscar producción"
        searchPlaceholder="Buscar por ID o estado..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={handleClearFilters}
        filterLabel="Filtrar por estado"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={statuses.map((status) => ({
          value: status.name,
          label: status.name,
        }))}
        columns={columns}
        data={paginatedData}
        loading={loading}
        emptyMessage="No hay producciones activas disponibles"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredProductions.length}
        itemsPerPage={itemsPerPage}
        showUpload={false}
        //para los pdfs y excels
        exportOptions={[
          {
            label: "PDF",
            onClick: () =>
              window.open(
              `${VITE_API_URL}/export/pdfproduction`,
                "_blank"
              ),
            variant: "outline-danger",
          },
          {
            label: "Excel",
            onClick: () =>
              window.open(
              `${VITE_API_URL}/export/excelproduction`,
              "_blank"
              ),
            variant: "outline-success",
          },
        ]}
        showExport={false}
        onAdd={openCreateModal}
        addLabel="Nueva Producción"
        showAdd={true}
        customActions={
          <Button
            variant={reactivateMode ? "danger" : "info"}
            onClick={() => setReactivateMode(!reactivateMode)}
            size="sm"
          >
            {reactivateMode ? "Salir de Reactivar" : "Reactivar"}
          </Button>
        }
        showHistory={true}
        onHistory={handleShowHistorialModal}
        historyLabel="Ver Historial"
      />

      <Modal show={showCreateModal} onHide={closeCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nueva Producción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="productSelect">
              <Form.Label>Producto</Form.Label>
              <Form.Select
                onChange={(e) => {
                  const productId = Number(e.target.value);
                  const prod = availableProducts.find(p => p.ID_PRODUCTO === productId);

                  if (!prod) return;

                  setSelectedItems(items => [
                    ...items,
                    {
                      id_product: prod.ID_PRODUCTO,
                      quantity: 0,
                      validation: null,
                    }
                  ]);
                }}
              >
                <option value="">Seleccione un producto</option>
                {availableProducts.map(prod => (
                  <option
                    key={prod.ID_PRODUCTO}
                    value={prod.ID_PRODUCTO}
                    disabled={selectedItems.some(i => i.id_product === prod.ID_PRODUCTO)}
                  >
                    {prod.NOMBRE_PROD}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {selectedItems.map((item, idx) => {
              const prod = availableProducts.find(p => p.ID_PRODUCTO === item.id_product);
              return (
                <Form.Group key={item.id_product} className="mt-2">
                  <Form.Label>{prod?.NOMBRE_PROD}</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="number"
                      placeholder="Cantidad a producir"
                      value={item.quantity}
                      onChange={async (e) => {
                        const qty = Number(e.target.value);

                        if (!qty || qty <= 0) {
                          setSelectedItems(items =>
                            items.map((it, i) =>
                              i === idx ? { ...it, quantity: qty, validation: null } : it
                            )
                          );
                          return;
                        }

                        const validation = await fetchValidation(item.id_product, qty);

                        setSelectedItems(items =>
                          items.map((it, i) =>
                            i === idx ? { ...it, quantity: qty, validation } : it
                          )
                        );
                      }}
                    />
                    <Button
                      variant="danger"
                      onClick={() =>
                        setSelectedItems(items => items.filter((_, i) => i !== idx))
                      }
                      className="ms-2"
                    >
                      X
                    </Button>
                  </div>

                  {item.validation && (
                    <div className="mt-2 small">
                      <div>
                        <strong>Máximo producible:</strong> {item.validation.maxProducible}
                      </div>
                      <div>
                        <strong>¿Se puede producir?</strong>{" "}
                        {item.validation.canProduce ? (
                          <span className="text-success">Sí ✅</span>
                        ) : (
                          <span className="text-danger">No ❌</span>
                        )}
                      </div>

                      {item.validation.missing.length > 0 && (
                        <div className="mt-1 text-danger">
                          <strong>Faltantes:</strong>
                          <ul className="mb-0">
                            {item.validation.missing.map((m, i) => (
                              <li key={i}>
                                {m.material_name}: faltan {m.missing}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>
              );
            })}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeCreateModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateProduction}>
            Crear Producción
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal size="lg" show={showHistorialModal} onHide={handleCloseHistorialModal}>
        <Modal.Header closeButton>
          <Modal.Title>Historial de Producción</Modal.Title>
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
            searchTerm={historialFilter}
            selectedFilter={""}
          />

          {historialTotalPages > 1 && (
            <TablePagination
              currentPage={historialCurrentPage}
              totalPages={historialTotalPages}
              onPageChange={setHistorialCurrentPage}
              totalItems={filteredHistorial.length}
              itemsPerPage={historialItemsPerPage}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseHistorialModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminProductions;
