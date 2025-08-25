"use client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Form, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import TableContainer from "../../../components/table-components/TableContainer";
import ExpandableText from "../../../components/table-components/ExpandableText";
import ProductModals from "./ProductModals";
import "./Products.css";
import "../../../components/table-components/table-components.css";

const MySwal = withReactContent(Swal);

export const AdminProducts = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [editProd, setEditProd] = useState(null);
  const [formProd, setFormProd] = useState(initialFormState());
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formCartProd, setFormCartProd] = useState(initialCartFormState());
  const [showCartModal, setShowCartModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const VITE_API_URL = import.meta.env.VITE_API_URL 

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  function initialFormState() {
    return {
      ID_TIPO_PRO: "",
      NOMBRE: "",
      PRECIO: "",
      DESCRIPCION: "",
      IMAGEN_URL: "",
      NOTA_ACTUAL: "",
      ADVERTENCIA: "",
    };
  }

  function initialCartFormState() {
    return {
      id_product: "",
      discount: "",
    };
  }

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${VITE_API_URL}/productos_crud`
      );
      setProductos(response.data);
      setFilteredProductos(response.data);
      // Extraer categorías únicas
      const uniqueCategories = [
        ...new Set(response.data.map((p) => p.NOMBRE_TIPO_PRO)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.error("Error al cargar los productos", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar productos
  const filterProducts = () => {
    let filtered = productos;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.NOMBRE_PROD?.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          product.DESCRIPCION?.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          product.NOMBRE_TIPO_PRO?.toLowerCase().includes(
            searchTerm.toLowerCase()
          )
      );
    }

    // Filtrar por categoría
    if (selectedCategory && selectedCategory !== "Todos") {
      filtered = filtered.filter(
        (product) => product.NOMBRE_TIPO_PRO === selectedCategory
      );
    }

    setFilteredProductos(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Efecto para filtrar cuando cambian los criterios
  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, productos]);

  useEffect(() => {
    fetchProductos();
  }, []);

  // Función para truncar texto
  const truncateText = (text, maxLength) => {
    if (!text) return "Sin información";
    if (window.innerWidth <= 576) {
      return text.length > 15 ? `${text.substring(0, 15)}...` : text;
    } else if (window.innerWidth <= 768) {
      return text.length > 20 ? `${text.substring(0, 20)}...` : text;
    } else if (window.innerWidth <= 992) {
      return text.length > 30 ? `${text.substring(0, 30)}...` : text;
    } else {
      return text.length > maxLength
        ? `${text.substring(0, maxLength)}...`
        : text;
    }
  };

  // Configuración de columnas para la tabla
  const productColumns = [
    {
      Header: "TIPO",
      accessor: "NOMBRE_TIPO_PRO",
      headerStyle: { width: "120px" },
      Cell: ({ value }) => <span>{truncateText(value, 10)}</span>,
    },
    {
      Header: "NOMBRE",
      accessor: "NOMBRE_PROD",
      headerStyle: { width: "150px" },
      Cell: ({ row }) => (
        <strong title={row.original.NOMBRE_PROD}>
          {row.original.ID_STATE === 2 && "⚠️ "}
          {truncateText(row.original.NOMBRE_PROD, 15)}
        </strong>
      ),
    },
    {
      Header: "PRECIO",
      accessor: "PRECIO",
      headerStyle: { width: "100px" },
      Cell: ({ value }) => (
        <span className="fw-bold">${Number(value).toLocaleString()}</span>
      ),
    },
    {
      Header: "DESCRIPCIÓN",
      accessor: "DESCRIPCION",
      headerStyle: { width: "250px" },
      Cell: ({ value }) => <ExpandableText text={value} maxLines={2} />,
    },
    {
      Header: "NOTA",
      accessor: "NOTA_ACTUAL",
      headerStyle: { width: "20px" },
      Cell: ({ value }) => <ExpandableText text={value} maxLines={1} />,
    },
    {
      Header: "IMG",
      accessor: "IMAGEN_URL",
      headerStyle: { width: "60px" },
      Cell: ({ value }) =>
        value ? (
          <span className="text-success">✅</span>
        ) : (
          <span className="text-danger">❌</span>
        ),
    },
    {
      Header: "ADVERTENCIA",
      accessor: "ADVERTENCIA",
      headerStyle: { width: "120px" },
      Cell: ({ value }) => <ExpandableText text={value} maxLines={2} />,
    },
    {
      Header: "ESTADO",
      accessor: "ID_STATE",
      headerStyle: { width: "100px" },
      Cell: ({ value }) => (
        <span
          className={`badge ${
            value === 2
              ? "bg-danger"
              : value === 2
              ? "bg-warning"
              : "bg-success"
          }`}
        >
          {value === 2 ? "Inactivo" : "Activo"}
        </span>
      ),
    },
    {
      Header: "ACCIONES",
      headerStyle: { width: "200px" },
      Cell: ({ row }) => {
        const prod = row.original;
        const isInactive = prod.ID_STATE === 2;

        return (
          <div className="container-buttons-product">
            <div className="container-buttons-product-v1">
              <Button
                variant="warning"
                size="sm"
                onClick={() => openEditModal(prod)}
                title={
                  isInactive
                    ? "Producto inactivo - No se puede editar"
                    : "Editar producto"
                }
                className="action-btn"
                disabled={isInactive}
              >
                Editar
              </Button>
              {isInactive ? (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() =>
                    handleActivate(prod.ID_PRODUCTO, prod.NOMBRE_PROD)
                  }
                  title="Activar producto"
                  className="action-btn btn-activate-highlight"
                >
                  Activar
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    handleDelete(prod.ID_PRODUCTO, prod.NOMBRE_PROD)
                  }
                  title="Inactivar producto"
                  className="action-btn btn-danger-custom"
                >
                  Inactivar
                </Button>
              )}
            </div>
            <div className="container-buttons-product-v2">
              <Button
                variant="info"
                size="sm"
                onClick={() => handleViewRecipes(prod)}
                title={
                  isInactive
                    ? "Producto inactivo - No se pueden ver recetas"
                    : "Ver recetas del producto"
                }
                className="action-btn"
                disabled={isInactive}
              >
                Ver
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => openCartModal(prod)}
                title={
                  isInactive
                    ? "Producto inactivo - No se puede agregar al carrito"
                    : "Agregar al carrito"
                }
                className="action-btn"
                disabled={isInactive}
              >
                Cart
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  const openInsertModal = () => {
    setFormProd(initialFormState());
    setShowInsertModal(true);
  };

  const openEditModal = (producto) => {
    setEditProd(producto);
    setFormProd({
      ID_TIPO_PRO: producto.ID_TIPO_PRO || "",
      NOMBRE: producto.NOMBRE_PROD || "",
      PRECIO: producto.PRECIO || "",
      DESCRIPCION: producto.DESCRIPCION || "",
      IMAGEN_URL: producto.IMAGEN_URL || "",
      NOTA_ACTUAL: producto.NOTA_ACTUAL || "",
      ADVERTENCIA: producto.ADVERTENCIA || "",
    });
    setShowEditModal(true);
  };

  const openCartModal = (producto) => {
    // Validar si el producto está inactivo
    if (producto.ID_STATE === 2) {
      toast.error("⚠️ No se puede agregar al carrito un producto inactivo", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }
    setFormCartProd({
      id_product: producto.ID_PRODUCTO,
      discount: "",
    });
    setShowCartModal(true);
  };

  const handleViewRecipes = (producto) => {
    // Validar si el producto está inactivo
    if (producto.ID_STATE === 2) {
      toast.error("⚠️ No se pueden ver las recetas de un producto inactivo", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }
    navigate(`/crud_rece/${producto.ID_PRODUCTO}`);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!formCartProd.discount) {
      toast.warn("Por favor ingresa un descuento válido", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    try {
      await axios.post(
        `${VITE_API_URL}/productos_crud/cart`,
        formCartProd
      );
      toast.success("Producto agregado al carrito exitosamente", {
        position: "top-right",
        autoClose: 3000,
      });
      closeModals();
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      toast.error("Error al agregar el producto al carrito", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const closeModals = () => {
    setShowInsertModal(false);
    setShowEditModal(false);
    setShowCartModal(false);
    setEditProd(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormProd((prev) => ({ ...prev, [name]: value }));
  };

  const handleInsert = async (e) => {
    e.preventDefault();
    if (!formProd.NOMBRE || !formProd.PRECIO) {
      toast.warn(
        "Por favor completa al menos el nombre y precio del producto",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
      return;
    }
    try {
      await axios.post(`${VITE_API_URL}/productos_crud`, formProd);
      toast.success("Producto creado exitosamente", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchProductos();
      closeModals();
    } catch (error) {
      console.error("Error al crear producto:", error);
      toast.error("Error al crear el producto", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formProd.NOMBRE || !formProd.PRECIO) {
      toast.warn(
        "Por favor completa al menos el nombre y precio del producto",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
      return;
    }
    try {
      await axios.put(
        `${VITE_API_URL}/productos_crud/${editProd.ID_PRODUCTO}`,
        formProd
      );
      toast.success(
        `Producto "${editProd.NOMBRE_PROD}" actualizado exitosamente`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      fetchProductos();
      closeModals();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("Error al actualizar el producto", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDelete = async (id, nombreProducto) => {
    const result = await MySwal.fire({
      title: "¿Estás seguro?",
      html: (
        <>
          ¿Estás seguro de que deseas inactivar el producto{" "}
          <b>"{nombreProducto}"</b>?
          <br />
          <span style={{ color: "#d33" }}>
            Esta acción no se puede deshacer.
          </span>
        </>
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      focusCancel: true,
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${VITE_API_URL}/productos_crud/product/${id}`
        );
        toast.success(`Producto "${nombreProducto}" inactivado correctamente`, {
          position: "top-right",
          autoClose: 3000,
        });
        fetchProductos();
      } catch (error) {
        console.error("Error al inactivar producto:", error);
        toast.error("No se pudo inactivar el producto", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleActivate = async (id, nombreProducto) => {
    try {
      await axios.put(
        `${VITE_API_URL}/productos_crud/activate/${id}`
      );
      toast.success(`Producto "${nombreProducto}" activado correctamente`, {
        position: "top-right",
        autoClose: 3000,
      });
      // Actualizar el estado local sin recargar
      setProductos((prev) =>
        prev.map((prod) =>
          prod.ID_PRODUCTO === id ? { ...prod, ID_STATE: 1 } : prod
        )
      );
      setFilteredProductos((prev) =>
        prev.map((prod) =>
          prod.ID_PRODUCTO === id ? { ...prod, ID_STATE: 1 } : prod
        )
      );
    } catch (error) {
      console.error("Error al activar producto:", error);
      toast.error("No se pudo activar el producto", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  const handleShowUploadModal = () => setShowUploadModal(true);
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setCsvFile(null);
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
      setLoading(true);
      const formData = new FormData();
      formData.append("file", csvFile);
      const response = await axios.post(
        `${VITE_API_URL}/productos_crud/cargar/product`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Carga masiva completada con éxito!");
      fetchProductos();
      handleCloseUploadModal();
    } catch (error) {
      console.error("Error al cargar el archivo:", error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Error al cargar el archivo. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const tiposProducto = Array.from(
    new Map(
      productos.map((p) => [
        p.ID_TIPO_PRO,
        { ID_TIPO_PRO: p.ID_TIPO_PRO, NOMBRE: p.NOMBRE_TIPO_PRO },
      ])
    ).values()
  );

  // Paginación
  const paginatedProductos = filteredProductos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

  return (
    <>
      <ToastContainer />

      <TableContainer
        title="Gestión de Productos"
        subtitle="Administra los productos de la panadería"
        // Search and filter props
        searchLabel="Buscar Productos"
        searchPlaceholder="Buscar por nombre, descripción o categoría..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterLabel="Filtrar por Categoría"
        filterValue={selectedCategory}
        onFilterChange={setSelectedCategory}
        filterOptions={categories}
        // Actions
        onClear={handleClearFilters}
        onAdd={openInsertModal}
        onUpload={handleShowUploadModal}
        addLabel="Nuevo Producto"
        uploadLabel="Cargar CSV"
        showUpload={true}
        // Export options
        exportOptions={[
          {
            label: "PDF",
            onClick: () => window.open(`${VITE_API_URL}/export/pdf`),
            variant: "outline-danger",
            icon: "/assets/pdf.svg",
          },
          {
            label: "Excel",
            onClick: () =>
              window.open(`${VITE_API_URL}/export/excel`),
            variant: "outline-success",
          },
        ]}
        // Table props
        columns={productColumns}
        data={paginatedProductos}
        loading={loading}
        emptyMessage={
          searchTerm || selectedCategory
            ? "No se encontraron productos con los criterios de búsqueda"
            : "No hay productos disponibles"
        }
        // Pagination props
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredProductos.length}
        itemsPerPage={itemsPerPage}
      />

      <ProductModals
        showInsertModal={showInsertModal}
        showEditModal={showEditModal}
        showCartModal={showCartModal}
        closeModals={closeModals}
        handleInsert={handleInsert}
        handleUpdate={handleUpdate}
        handleAddToCart={handleAddToCart}
        formProd={formProd}
        handleChange={handleChange}
        formCartProd={formCartProd}
        setFormCartProd={setFormCartProd}
        editProd={editProd}
        tiposProducto={tiposProducto}
      />

      {/* Modal para carga masiva */}
      <Modal show={showUploadModal} onHide={handleCloseUploadModal}>
        <Modal.Header closeButton>
          <Modal.Title>Carga Masiva de Productos</Modal.Title>
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
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Cargar"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminProducts;
