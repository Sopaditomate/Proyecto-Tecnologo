"use client";
import { Container } from "react-bootstrap";
import TableControls from "./TableControls";
import DataTable from "./DataTable";
import TablePagination from "./TablePagination";
import { useNavigate } from "react-router-dom";


const TableContainer = ({
  title,
  subtitle,
  // Search and filter props
  searchLabel = "Buscar",
  searchPlaceholder = "Buscar...",
  searchTerm = "",
  onSearchChange,
  filterLabel = "Filtrar",
  filterValue = "",
  onFilterChange,
  filterOptions = [],
  // Action props
  onClear,
  onAdd,
  onHistory,
  onUpload,
  addLabel = "Agregar",
  historyLabel = "Historial",
  uploadLabel = "Cargar CSV",
  showAdd = true,
  showHistory = false,
  showUpload = false,
  customActions,
  exportOptions = [],
  // Table props
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No hay datos disponibles",
  // Pagination props
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  showPagination = true,
  className = "",
  btnBack,
}) => {
  const navigate = useNavigate();
  return (
    <Container fluid className={`mt-4 ${className}`}>
      {title && (
        <div>
          {btnBack && (
            <button className="btn-back-datatables" onClick={() => navigate(-1)}
            >
              Volver
            </button>
          )}
          <h2 className="text-3xl font-bold text-center text-brown-700">
            {title}
          </h2>

          {subtitle && (
            <p className="text-center text-muted mt-2">{subtitle}</p>
          )}

        </div>
      )}

      <TableControls
        searchLabel={searchLabel}
        searchPlaceholder={searchPlaceholder}
        searchTerm={searchTerm}
        setSearchTerm={onSearchChange}
        filterLabel={filterLabel}
        filterValue={filterValue}
        setFilterValue={onFilterChange}
        filterOptions={filterOptions}
        onClear={onClear}
        onAdd={onAdd}
        onHistory={onHistory}
        onUpload={onUpload}
        addLabel={addLabel}
        historyLabel={historyLabel}
        uploadLabel={uploadLabel}
        showAdd={showAdd}
        showHistory={showHistory}
        showUpload={showUpload}
        customActions={customActions}
        exportOptions={exportOptions}
        loading={loading}
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage={emptyMessage}
        onClearFilters={onClear}
        searchTerm={searchTerm}
        selectedFilter={filterValue}
        tableBorderStyle="2px solid #000"
      />

      {showPagination && totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </Container>
  );
};

export default TableContainer;
