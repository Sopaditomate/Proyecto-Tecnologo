"use client";

import { useNavigate } from "react-router-dom";
import { Container, Table, Button } from "react-bootstrap";

export function TableDetails({ title, btnBack, subtitle, columns, data, loading, emptyMessage }) {
  const navigate = useNavigate();

  // Manejar el retorno a la página anterior
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container fluid className="reusable-component-container">
      <div className="controls-section">
        {btnBack && (
          <Button
            className="w-25 clear-btn"
            variant="outline-secondary"
            onClick={handleGoBack}
          >
            Volver
          </Button>
        )}
      </div>

      <div className="table-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {/* Contenedor de tabla */}
      <div className="table-container">
        <div className="table-responsive">
          <Table className="table">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index} style={col.headerStyle}>
                    {col.Header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">Cargando...</td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={index}>
                    {columns.map((col) => (
                      <td key={col.accessor}>
                        {col.Cell ? col.Cell({ value: row[col.accessor], row }) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center">{emptyMessage}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </Container>
  );
}

export default TableDetails;
