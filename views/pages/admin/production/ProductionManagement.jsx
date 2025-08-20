import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableContainer from "../../../components/table-components/TableContainer";

export const AdminProductions = () => {
  const [productions, setProductions] = useState([]);
  const [filteredProductions, setFilteredProductions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statuses, setStatuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  //prueba para el modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);



  // === Cargar producciones activas ===
  const fetchProductions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5001/api/produccion/production");
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

  // === Filtro por búsqueda (simple por ID o status) ===
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


  useEffect(() => {
    filterProductions();
  }, [searchTerm, statusFilter, productions]);


    const fetchStatuses = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/produccion/production/status");
      setStatuses(res.data);
    } catch (err) {
      console.error("Error al obtener estados:", err);
      toast.error("Error al obtener los estados de producción.");
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);


  const fetchAvailableProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/productos_crud");
      setAvailableProducts(res.data);
    } catch (err) {
      console.error("Error al obtener productos disponibles:", err);
      toast.error("Error al cargar productos para la nueva producción.");
    }
  };

  useEffect(() => {
    fetchAvailableProducts();
  }, []);



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
    // {
    //   Header: "ID Usuario",
    //   accessor: "id_user",
    // }, comentada la parte de usuario, hasta que se le vea un uso
  ];

  // === Paginación ===
  const paginatedData = filteredProductions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProductions.length / itemsPerPage);

  //limpia los nuevos filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const openCreateModal = () => {
    setSelectedItems([]);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
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
      showExport={false}
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
                const prod = availableProducts.find(p => p.ID_PRODUCTO === Number(e.target.value));
                if (prod && !selectedItems.some(item => item.id_product === prod.ID_PRODUCTO)) {
                  setSelectedItems([...selectedItems, { id_product: prod.ID_PRODUCTO, quantity: "" }]);
                }
              }}
            >
              <option value="">Seleccione un producto</option>
              {availableProducts.map(prod => (
                <option key={prod.ID_PRODUCTO} value={prod.ID_PRODUCTO}>
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
                    placeholder="Cantidad"
                    value={item.quantity}
                    onChange={(e) => {
                      const qty = e.target.value;
                      setSelectedItems(items =>
                        items.map((it, i) => i === idx ? { ...it, quantity: qty } : it)
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
    </>
  );
};

export default AdminProductions;


