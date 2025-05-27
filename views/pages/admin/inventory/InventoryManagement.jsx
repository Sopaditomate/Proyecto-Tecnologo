import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { useTable, usePagination } from 'react-table';  // Usamos useTable y usePagination de React Table
import './inventory.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/inventario/');
      setInventory(response.data);  // Guardamos los datos en el estado
    } catch (error) {
      console.error('Error al obtener el inventario:', error);
    }
  };

  // Definir las columnas
  const columns = React.useMemo(
    () => [
      {
        Header: 'ID Inventario',
        accessor: 'ID_INVENTARIO',
      },
      {
        Header: 'Materia Prima',
        accessor: 'MATERIA_PRIMA',
      },
      {
        Header: 'Cantidad',
        accessor: 'CANTIDAD',
      },
      {
        Header: 'Unidad',
        accessor: 'UNIDAD',
      },
      {
        Header: 'Tipo',
        accessor: 'TIPO',
      },
    ],
    []
  );

  // Configuración de la tabla con React Table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { pageIndex, pageSize },
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    setPageSize,
    page, // Aquí es donde tomamos solo los registros de la página actual
  } = useTable(
    {
      columns,
      data: inventory, // Este es el estado con los datos
      initialState: { pageIndex: 0, pageSize: 5 }, // Página inicial y tamaño de página por defecto
    },
    usePagination // Usamos el hook de paginación
  );

  return (
    <Container>
      <br />
      <h1 className="text-3xl font-bold text-center text-brown-700 mb-6">Gestión de Inventario</h1>
      <div className="flex my-4 justify-center w-2/5 mx-auto">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              Mostrar {size}
            </option>
          ))}
        </select>
      </div>
      <div className='tableTail'>
        
        <table
          {...getTableProps()}
          className="Custom"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-100">
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    className="px-4 py-2 text-left font-semibold text-gray-700"
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="border-b hover:bg-gray-50">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="px-4 py-2 text-gray-800">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Controles de Paginación */}
      <div className="pagination-container flex justify-center items-center space-x-2">
        {/* Botón "Primera página" */}
        <button
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
          className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:bg-gray-400"
        >
          {'<<'}
        </button>

        {/* Botón "Página anterior" */}
        <button
          onClick={() => gotoPage(pageIndex - 1)}
          disabled={!canPreviousPage}
          className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:bg-gray-400"
        >
          {'<'}
        </button>

        {/* Información sobre la página actual */}
        <span className="page-info">
          Página {pageIndex + 1} de {pageOptions.length}
        </span>

        {/* Botón "Página siguiente" */}
        <button
          onClick={() => gotoPage(pageIndex + 1)}
          disabled={!canNextPage}
          className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:bg-gray-400"
        >
          {'>'}
        </button>

        {/* Botón "Última página" */}
        <button
          onClick={() => gotoPage(pageOptions.length - 1)}
          disabled={!canNextPage}
          className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 disabled:bg-gray-400"
        >
          {'>>'}
        </button>

        {/* Selector de tamaño de página */}
        
      </div>
    </Container>
  );
};

export default InventoryManagement;
