import React, { useEffect, useState } from 'react';

import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
//import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import { Container, Table, Button } from 'react-bootstrap';
import './UsersAdmin.css';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [userStatus, setUserStatus] = useState({}); // Guarda los estados locales
  const [loadingIds, setLoadingIds] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [noResults, setNoResults] = useState(false);

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

  

  const toggleStatus = async (id_user) => {
    const isActive = userStatus[id_user];

    const confirmResult = await Swal.fire({
      title: `¿Estás seguro de ${isActive ? 'desactivar' : 'activar'} este usuario?`,
      text: `Este cambio se aplicará inmediatamente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmResult.isConfirmed) return;

    if (loadingIds.includes(id_user)) return;

    setLoadingIds((prev) => [...prev, id_user]);

    try {
      await axios.put(`http://localhost:5001/api/user/state/${id_user}`);

      const newStatus = !userStatus[id_user]; // obtener nuevo estado basado en estado actual

      setUserStatus((prev) => ({
        ...prev,
        [id_user]: newStatus,
      }));

      // Mostrar toast **fuera** de setUserStatus para evitar doble ejecución
      toast.success(`Usuario ${id_user} ha sido ${newStatus ? 'activado' : 'desactivado'}.`);
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      Swal.fire('Error', 'No se pudo cambiar el estado del usuario. Intenta nuevamente.', 'error');
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== id_user));
    }
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
              disabled={loadingIds.includes(row.original.id_user)}
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
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex },
    setPageSize,
    setGlobalFilter: setTableGlobalFilter,
  } = useTable(
    {
      columns,
      data: users,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    useGlobalFilter,
    usePagination
  );

  useEffect(() => {
    setTableGlobalFilter(globalFilter);
  }, [globalFilter, setTableGlobalFilter]);

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setGlobalFilter(value);

    const results = users.filter(user =>
      user.first_name.toLowerCase().includes(value) ||
      user.last_name.toLowerCase().includes(value) ||
      user.email.toLowerCase().includes(value) ||
      user.address.toLowerCase().includes(value) ||
      user.phone.toLowerCase().includes(value) ||
      user.role_name.toLowerCase().includes(value)
    );

    setNoResults(results.length === 0 && value !== '');
  };

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

      <div className="mb-3">
        <label htmlFor="search" className="form-label">Buscar usuario:</label>
        <div className="input-group">
          <input
            type="text"
            id="search"
            value={globalFilter || ''}
            onChange={handleSearchChange}
            className="form-control"
            placeholder="Escribe para buscar..."
          />
          {globalFilter && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setGlobalFilter('')}
            >
              &times;
            </button>
          )}
        </div>
        {noResults && (
          <div className="text-danger mt-2">Sin coincidencias encontradas</div>
        )}
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
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};
