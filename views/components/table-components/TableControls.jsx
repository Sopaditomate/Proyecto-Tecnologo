"use client";
import { Row, Col, Form, InputGroup, Button } from "react-bootstrap";

const TableControls = ({
  searchLabel = "Buscar Productos",
  searchPlaceholder = "Buscar por nombre, descripción o categoría...",
  searchTerm = "",
  setSearchTerm,
  filterLabel = "Filtrar por Categoría",
  filterValue = "",
  setFilterValue,
  filterOptions = [],
  onClear,
  onAdd,
  onHistory,
  onUpload,
  addLabel = "Nuevo Producto",
  historyLabel = "Historial",
  uploadLabel = "Cargar CSV",
  showAdd = true,
  showHistory = false,
  showUpload = false,
  customActions,
  exportOptions = [],
  loading = false,
}) => {
  const hasQuickActions =
    (showAdd && onAdd) ||
    (showHistory && onHistory) ||
    (showUpload && onUpload) ||
    (customActions && React.Children.count(customActions) > 0);
  return (
    <div className="controls-section">
      {/* Sección de Búsqueda, Filtros y Limpiar */}
      <Row className="mb-2">
        {/* Buscar */}
        <Col>
          <Form.Group>
            <Form.Label className="form-label-custom fw-semibold">
              {searchLabel}
            </Form.Label>
            <InputGroup>
              <InputGroup.Text className="search-icon-admin">
                <img src="/assets/search.svg" alt="Buscar" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input border-start-0 ps-0"
                disabled={loading}
              />
            </InputGroup>
          </Form.Group>
        </Col>

        {/* Filtro por Categoría */}
        <Col xl={4} lg={4} md={4} sm={6}>
          <Form.Group>
            <Form.Label className="form-label-custom fw-semibold">
              {filterLabel}
            </Form.Label>
            <Form.Select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="category-select"
              disabled={loading}
            >
              <option value="">Todas las categorías</option>
              {filterOptions.map((opt, idx) => (
                <option key={idx} value={opt.value || opt}>
                  {opt.label || opt}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Botón Limpiar */}
        <Col lg={2} md={2} sm={6} className="mb-2">
          <Form.Label className="form-label-custom">&nbsp;</Form.Label>
          <Button
            variant="outline-secondary"
            onClick={onClear}
            className="w-100 clear-btn"
            disabled={loading}
          >
            Limpiar
          </Button>
        </Col>
      </Row>

      {/* Sección de Acciones Rápidas y Exportación */}
      <div className="actions-export-section pt-3 border-top">
        <Row className="align-items-center">
          <Col
            lg={6}
            md={12}
            sm={12}
            className="d-flex flex-column align-items-center align-items-lg-start"
          >
            <div className="quick-actions-section w-100">
              {hasQuickActions && (
                <h6 className="d-flex justify-content-center justify-content-lg-start">
                  <span className="me-2 fs-4"></span>
                  Acciones Rápidas:
                </h6>
              )}
              <div className="quick-actions-compact d-flex gap-2 flex-wrap justify-content-center justify-content-lg-start">
                {showAdd && onAdd && (
                  <Button
                    variant="success"
                    onClick={onAdd}
                    disabled={loading}
                    className="add-product-btn-main btn-secondary"
                    size="sm"
                    style={{
                      background:
                        "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                      border: "none",
                    }}
                  >
                    <span className="me-1"></span>
                    {addLabel}
                  </Button>
                )}
                {showHistory && onHistory && (
                  <Button
                    variant="info"
                    onClick={onHistory}
                    disabled={loading}
                    className="ver-historial btn-secondary"
                    size="sm"
                    style={{
                      background:
                        "linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)",
                      border: "none",
                      color: "#fff",
                    }}
                  >
                    <span className="me-1"></span>
                    {historyLabel}
                  </Button>
                )}
                {showUpload && onUpload && (
                  <Button
                    variant="secondary"
                    onClick={onUpload}
                    disabled={loading}
                    className="cargar-csv"
                    size="sm"
                    style={{
                      background:
                        "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)",
                      border: "none",
                    }}
                  >
                    <span className="me-1 "></span>
                    {uploadLabel}
                  </Button>
                )}
                {customActions}
              </div>
            </div>

          </Col>

          {/* Sección de Exportación */}
          {exportOptions.length > 0 && (
            <Col lg={6} md={12} sm={12}>
              <div className="export-section">
                <h6 className="mt-4">
                  <span className="me-2 "></span>
                  Opciones de Exportación:
                </h6>
                <div className="export-buttons-group d-flex gap-2 flex-wrap">
                  {exportOptions.map((option, index) => {
                    let iconSrc = "";
                    if (option.label.toLowerCase() === "pdf") {
                      iconSrc = "/assets/pdf.svg";
                    } else if (option.label.toLowerCase() === "excel") {
                      iconSrc = "/assets/excel.svg";
                    }

                    return (
                      <Button
                        key={index}
                        variant={option.variant || "outline-primary"}
                        onClick={option.onClick}
                        disabled={loading}
                        size="md"
                        className="export-btn d-flex align-items-center justify-content-center px-4 py-1 mt-3"
                        style={{ width: "110px", height: "50px" }}
                      >
                        {iconSrc && (
                          <img
                            src={iconSrc}
                            className="me-2"
                            style={{
                              width: "20px",
                              height: "20px",
                              objectFit: "contain",
                            }}
                          />
                        )}
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default TableControls;
