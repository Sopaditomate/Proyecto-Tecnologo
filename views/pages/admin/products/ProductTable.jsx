import { Table, Button } from "react-bootstrap";

const ProductTable = ({
  filteredProductos,
  productos,
  searchTerm,
  selectedCategory,
  setSearchTerm,
  setSelectedCategory,
  truncateText,
  isRowExpanded,
  toggleExpandRow,
  openEditModal,
  handleActivate,
  handleDelete,
  handleViewRecipes,
  openCartModal,
  loading,
}) => (
  <div className={`table-container ${loading ? "loading-overlay" : ""}`}>
    <div className="table-responsive">
      <Table striped bordered hover className="table">
        <thead>
          <tr>
            <th>TIPO</th>
            <th>NOMBRE</th>
            <th>PRECIO</th>
            <th>DESCRIPCIÓN</th>
            <th>NOTA</th>
            <th>IMG</th>
            <th>ADVERTENCIA</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {filteredProductos.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center py-4">
                <div className="empty-state">
                  <p className="text-muted mb-0">
                    {searchTerm || selectedCategory
                      ? "No se encontraron productos con los criterios de búsqueda"
                      : "No hay productos disponibles"}
                  </p>
                  {(searchTerm || selectedCategory) && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("");
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            filteredProductos.map((prod) => (
              <tr
                key={prod.ID_PRODUCTO}
                className={prod.ID_STATE === 2 ? "inactive-row" : ""}
              >
                <td>
                  <span className="badge bg-primary">
                    {truncateText(prod.NOMBRE_TIPO_PRO, 10)}
                  </span>
                </td>
                <td>
                  <strong title={prod.NOMBRE_PROD}>
                    {prod.ID_STATE === 2 && "⚠️ "}
                    {truncateText(prod.NOMBRE_PROD, 15)}
                  </strong>
                </td>
                <td>
                  <span className="fw-bold">
                    ${Number(prod.PRECIO).toLocaleString()}
                  </span>
                </td>
                <td
                  style={{
                    maxWidth: 220,
                    whiteSpace: "normal",
                    textAlign: "left",
                  }}
                >
                  <span
                    className="description-text"
                    style={{ display: "inline" }}
                  >
                    {prod.DESCRIPCION &&
                    prod.DESCRIPCION.length > 40 &&
                    !isRowExpanded(prod.ID_PRODUCTO) ? (
                      <>
                        {prod.DESCRIPCION.slice(0, 40)}...
                        <Button
                          variant="link"
                          size="sm"
                          style={{
                            padding: 0,
                            marginLeft: 4,
                            color: "#8b4513",
                            fontWeight: 500,
                            textDecoration: "underline",
                            verticalAlign: "baseline",
                          }}
                          onClick={() => toggleExpandRow(prod.ID_PRODUCTO)}
                        >
                          Ver más
                        </Button>
                      </>
                    ) : prod.DESCRIPCION &&
                      prod.DESCRIPCION.length > 40 &&
                      isRowExpanded(prod.ID_PRODUCTO) ? (
                      <>
                        {prod.DESCRIPCION}
                        <Button
                          variant="link"
                          size="sm"
                          style={{
                            padding: 0,
                            marginLeft: 4,
                            color: "#8b4513",
                            fontWeight: 500,
                            textDecoration: "underline",
                            verticalAlign: "baseline",
                          }}
                          onClick={() => toggleExpandRow(prod.ID_PRODUCTO)}
                        >
                          Ver menos
                        </Button>
                      </>
                    ) : (
                      prod.DESCRIPCION || "Sin descripción"
                    )}
                  </span>
                </td>
                <td title={prod.NOTA_ACTUAL}>
                  {truncateText(prod.NOTA_ACTUAL, 15) || "Sin notas"}
                </td>
                <td>
                  {prod.IMAGEN_URL ? (
                    <span className="text-success">✅</span>
                  ) : (
                    <span className="text-danger">❌</span>
                  )}
                </td>
                <td title={prod.ADVERTENCIA}>
                  {truncateText(prod.ADVERTENCIA, 15) || "Sin advertencias"}
                </td>
                <td>
                  <span
                    className={`badge ${
                      prod.ID_STATE === 3
                        ? "bg-danger"
                        : prod.ID_STATE === 2
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                  >
                    {prod.ID_STATE === 2 ? "Inactivo" : "Activo"}
                  </span>
                </td>
                <td>
                  <div className="container-buttons-product">
                    <div className="container-buttons-product-v1">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => openEditModal(prod)}
                        title={
                          prod.ID_STATE === 2
                            ? "Producto inactivo - Editar"
                            : "Editar producto"
                        }
                        className="action-btn"
                      >
                        Editar
                      </Button>
                      {prod.ID_STATE === 2 ? (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            handleActivate(prod.ID_PRODUCTO, prod.NOMBRE_PROD)
                          }
                          title="Activar producto"
                          className="action-btn"
                        >
                          Activ
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleDelete(prod.ID_PRODUCTO, prod.NOMBRE_PROD)
                          }
                          title="Inactivar producto"
                          className="action-btn"
                        >
                          Inact
                        </Button>
                      )}
                    </div>
                    <div className="container-buttons-product-v2">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleViewRecipes(prod)}
                        title={
                          prod.ID_STATE === 2
                            ? "Producto inactivo - No se pueden ver recetas"
                            : "Ver recetas del producto"
                        }
                        className="action-btn"
                        disabled={prod.ID_STATE === 2}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => openCartModal(prod)}
                        title={
                          prod.ID_STATE === 2
                            ? "Producto inactivo - No se puede agregar al carrito"
                            : "Agregar al carrito"
                        }
                        className="action-btn"
                        disabled={prod.ID_STATE === 2}
                      >
                        Cart
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  </div>
);

export default ProductTable;
