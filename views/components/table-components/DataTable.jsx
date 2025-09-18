"use client";
import { Table, Button, Spinner } from "react-bootstrap";

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No hay datos disponibles",
  onClearFilters,
  searchTerm = "",
  selectedFilter = "",
  striped = true,
  //bordered = true,
  hover = true,
  responsive = true,
  className = "",
  rowClassName = () => "",
  onRowClick,
  tableBorderStyle = 'none', // Propiedad adicional para estilo de borde
}) => {
  const renderEmptyState = () => (
    <tr>
      <td colSpan={columns.length} className="text-center py-4">
        <div className="empty-state">
          <p className="text-muted mb-0">{emptyMessage}</p>
          {(searchTerm || selectedFilter) && onClearFilters && (
            <Button
              variant="link"
              size="sm"
              onClick={onClearFilters}
              className="mt-2"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  const renderLoadingState = () => (
    <tr>
      <td colSpan={columns.length} className="text-center py-4">
        <Spinner animation="border" size="sm" className="me-2" />
        Cargando datos...
      </td>
    </tr>
  );

  const renderCell = (column, row, rowIndex) => {
    if (column.Cell) {
      return column.Cell({
        row: { original: row, index: rowIndex },
        value: row[column.accessor],
      });
    }

    if (column.accessor) {
      const value = row[column.accessor];
      return column.format ? column.format(value, row) : value;
    }

    return null;
  };

  // Función para determinar si una fila está inactiva
  const getRowClassName = (row, rowIndex) => {
    let className = rowClassName(row, rowIndex);

    // productos inactivos
    if (row.ID_STATE === 2) {
      className += " inactive-row";
    }

    return className;
  };

  const tableContent = (
    <Table
      striped={striped}
      //bordered={bordered}
      hover={hover}
      className={`table ${className}`}
      style={{
        border: tableBorderStyle, // Aplica el estilo de borde que recibimos como propiedad
        borderRadius: "10px",
        borderCollapse: 'collapse', // Para que los bordes no se dupliquen
        overflow: 'hidden', // Para asegurarte de que el contenido no sobresalga
      }}
    >
      <thead className="">
        <tr>
          {columns.map((column, index) => (
            <th
              key={column.accessor || index}
              style={column.headerStyle}
              className={column.headerClassName}
            >
              {column.Header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading
          ? renderLoadingState()
          : data.length === 0
          ? renderEmptyState()
          : data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={getRowClassName(row, rowIndex)}
                onClick={
                  onRowClick ? () => onRowClick(row, rowIndex) : undefined
                }
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={column.accessor || colIndex}
                    style={column.cellStyle}
                    className={column.cellClassName}
                  >
                    {renderCell(column, row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
    </Table>
  );

  return responsive ? (
    <div className="table-responsive">{tableContent}</div>
  ) : (
    tableContent
  );
};

export default DataTable;
