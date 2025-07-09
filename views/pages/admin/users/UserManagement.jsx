import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTable, usePagination } from 'react-table';
import { Container, Table, Button } from 'react-bootstrap';
import './UsersAdmin.css';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [userStatus, setUserStatus] = useState({}); // Guarda los estados locales

  // Obtener los usuarios al montar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/user/info');
      setUsers(response.data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      const initialStatus = {};
      users.forEach(user => {
        // Simulamos que todos los usuarios están activos al inicio
        initialStatus[user.id_user] = true;
      });
      setUserStatus(initialStatus);
    }
  }, [users]);

  const toggleStatus = (id_user) => {
    setUserStatus((prev) => ({
      ...prev,
      [id_user]: !prev[id_user],
    }));
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id_user',
      },
      {
        Header: 'Nombre',
        accessor: 'first_name',
      },
      {
        Header: 'Apellido',
        accessor: 'last_name',
      },
      {
        Header: 'Correo',
        accessor: 'email',
      },
      {
        Header: 'Dirección',
        accessor: 'address',
      },
      {
        Header: 'Teléfono',
        accessor: 'phone',
      },
      {
        Header: 'Rol',
        accessor: 'role_name',
      },
      {
        Header: 'Estado',
        Cell: ({ row }) => {
          const isActive = userStatus[row.original.id_user];
          return (
            <span
              className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}
              style={{ cursor: 'default' }}
            >
              {isActive ? 'Activo' : 'Inactivo'}
            </span>
          );
        },
      },
      {
        Header: 'Acciones',
        Cell: ({ row }) => {
          const isActive = userStatus[row.original.id_user];
          return (
            <Button
              variant={isActive ? 'danger' : 'success'}
              onClick={() => toggleStatus(row.original.id_user)}
              size="sm"
            >
              {isActive ? 'Inactivar' : 'Activar'}
            </Button>
          );
        },
      },
    ],
    [userStatus]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // solo una página a la vez
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex },
    setPageSize,
  } = useTable(
    {
      columns,
      data: users,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    usePagination
  );

  return (
    <Container>
      <h2 className="text-center my-4">Gestión de Usuarios</h2>

      <div className="mb-3 d-flex justify-content-end">
        <select
          value={pageOptions.length ? pageOptions[pageIndex] : 5}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="form-select w-auto"
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              Mostrar {size}
            </option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover {...getTableProps()} className="Custom">
          <thead>
            {headerGroups.map((headerGroup, i) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={i}>
                {headerGroup.headers.map((column, j) => (
                  <th {...column.getHeaderProps()} key={j}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={i}>
                  {row.cells.map((cell, j) => (
                    <td {...cell.getCellProps()} key={j}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="pagination-container flex justify-center items-center space-x-2 mt-4">
        <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </Button>
        <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </Button>
        <span>
          Página {pageIndex + 1} de {pageOptions.length}
        </span>
        <Button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </Button>
        <Button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>
          {'>>'}
        </Button>
      </div>
    </Container>
  );
};
