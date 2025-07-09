import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";

const ProductControls = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  loading,
  openInsertModal,
  productos,
  filteredProductos,
}) => (
  <div className="controls-section">
    <Row className="mb-3">
      <Col lg={4} md={6} sm={12} className="mb-2">
        <Form.Label className="form-label-custom">Buscar Productos</Form.Label>
        <InputGroup>
          <InputGroup.Text className="search-icon">🔍</InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre, descripción o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </InputGroup>
      </Col>
      <Col lg={3} md={4} sm={6} className="mb-2">
        <Form.Label className="form-label-custom">
          Filtrar por Categoría
        </Form.Label>
        <Form.Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">Todas las categorías</option>
          <option value="Todos">Todos</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </Form.Select>
      </Col>
      <Col lg={2} md={2} sm={6} className="mb-2">
        <Form.Label className="form-label-custom">&nbsp;</Form.Label>
        <Button
          variant="outline-secondary"
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("");
          }}
          className="w-100 clear-btn"
        >
          Limpiar
        </Button>
      </Col>
      <Col lg={3} md={12} sm={12} className="mb-2">
        <Form.Label className="form-label-custom">Acciones Rápidas</Form.Label>
        <div className="quick-actions">
          <Button
            variant="success"
            onClick={openInsertModal}
            disabled={loading}
            className="add-product-btn-main"
          >
            Nuevo Producto
          </Button>
        </div>
      </Col>
    </Row>
    <Row className="align-items-center">
      <Col lg={6} md={8} sm={12}>
        <div className="results-info">
          <span className="results-text">
            Mostrando <strong>{filteredProductos.length}</strong> de{" "}
            <strong>{productos.length}</strong> productos
            {searchTerm && (
              <span className="search-term">
                {" "}
                para "<em>{searchTerm}</em>"
              </span>
            )}
            {selectedCategory && selectedCategory !== "Todos" && (
              <span className="category-filter">
                {" "}
                en categoría "<em>{selectedCategory}</em>"
              </span>
            )}
          </span>
        </div>
      </Col>
      <Col lg={6} md={4} sm={12}>
        <div className="export-section">
          <span className="export-label">Exportar:</span>
          <div className="export-buttons-group">
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() =>
                window.open(`http://localhost:5001/api/export/pdf`)
              }
              disabled={loading}
              className="export-btn"
            >
              PDF
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              onClick={() =>
                window.open(`http://localhost:5001/api/export/excel`)
              }
              disabled={loading}
              className="export-btn"
            >
              Excel
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  </div>
);

export default ProductControls;
