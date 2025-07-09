"use client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Products.css";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ProductControls from "./ProductControls";
import ProductTable from "./ProductTable";
import ProductModals from "./ProductModals";

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
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [cartProductIds, setCartProductIds] = useState([]); // Estado para IDs de productos en el carrito
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
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
        "http://localhost:5001/api/productos_crud"
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
        autoClose: 30,
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
  };

  // Efecto para filtrar cuando cambian los criterios
  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, productos]);

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
    if (producto.ID_STATE === 3) {
      toast.error("⚠️ No se puede agregar al carrito un producto inactivo", {
        position: "top-center",
        autoClose: 40,
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
    if (producto.ID_STATE === 3) {
      toast.error("⚠️ No se pueden ver las recetas de un producto inactivo", {
        position: "top-center",
        autoClose: 40,
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
        autoClose: 30,
      });
      return;
    }
    try {
      await axios.post(
        "http://localhost:5001/api/productos_crud/cart",
        formCartProd
      );
      toast.success("Producto agregado al carrito exitosamente", {
        position: "top-right",
        autoClose: 30,
      });
      closeModals();
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      toast.error("Error al agregar el producto al carrito", {
        position: "top-right",
        autoClose: 30,
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
          autoClose: 30,
        }
      );
      return;
    }
    try {
      await axios.post("http://localhost:5001/api/productos_crud", formProd);
      toast.success("Producto creado exitosamente", {
        position: "top-right",
        autoClose: 30,
      });
      fetchProductos();
      closeModals();
    } catch (error) {
      console.error("Error al crear producto:", error);
      toast.error("Error al crear el producto", {
        position: "top-right",
        autoClose: 30,
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
          autoClose: 30,
        }
      );
      return;
    }
    try {
      await axios.put(
        `http://localhost:5001/api/productos_crud/${editProd.ID_PRODUCTO}`,
        formProd
      );
      toast.success(
        `Producto "${editProd.NOMBRE_PROD}" actualizado exitosamente`,
        {
          position: "top-right",
          autoClose: 30,
        }
      );
      fetchProductos();
      closeModals();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("Error al actualizar el producto", {
        position: "top-right",
        autoClose: 30,
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
          `http://localhost:5001/api/productos_crud/product/${id}`
        );
        toast.success(`Producto "${nombreProducto}" inactivado correctamente`, {
          position: "top-right",
          autoClose: 30,
        });
        fetchProductos();
      } catch (error) {
        console.error("Error al inactivar producto:", error);
        toast.error("No se pudo inactivar el producto", {
          position: "top-right",
          autoClose: 30,
        });
      }
    }
  };

  const handleActivate = async (id, nombreProducto) => {
    try {
      await axios.put(
        `http://localhost:5001/api/productos_crud/activate/${id}`
      );
      toast.success(`Producto "${nombreProducto}" activado correctamente`, {
        position: "top-right",
        autoClose: 30,
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
        autoClose: 30,
      });
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

  // Función para truncar texto según el tamaño de pantalla
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
              min="0"
              step="0.01"
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

  const isRowExpanded = (id) => expandedRows.includes(id);

  const toggleExpandRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <Container fluid className="mt-4">
      <h2>Gestión de Productos</h2>
      <ProductControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        loading={loading}
        openInsertModal={openInsertModal}
        productos={productos}
        filteredProductos={filteredProductos}
      />
      <ProductTable
        filteredProductos={filteredProductos}
        productos={productos}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        setSearchTerm={setSearchTerm}
        setSelectedCategory={setSelectedCategory}
        truncateText={truncateText}
        isRowExpanded={isRowExpanded}
        toggleExpandRow={toggleExpandRow}
        openEditModal={openEditModal}
        handleActivate={handleActivate}
        handleDelete={handleDelete}
        handleViewRecipes={handleViewRecipes}
        openCartModal={openCartModal}
        loading={loading}
        cartProductIds={cartProductIds}
      />
      <div className="scroll-indicator">
        Desliza horizontalmente para ver más columnas
      </div>
      <ProductModals
        showInsertModal={showInsertModal}
        showEditModal={showEditModal}
        showCartModal={showCartModal}
        closeModals={closeModals}
        handleInsert={handleInsert}
        handleUpdate={handleUpdate}
        handleAddToCart={handleAddToCart}
        renderFormFields={renderFormFields}
        formCartProd={formCartProd}
        setFormCartProd={setFormCartProd}
        editProd={editProd}
      />
      <ToastContainer
        position="top-right"
        autoClose={30}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Container>
  );
};
