import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export const AdminProducts = () => {
  const [productos, setProductos] = useState([]);
  const [editProd, setEditProd] = useState(null);
  const [newProd, setNewProd] = useState({
    ID_TIPO_PRO: "",
    NOMBRE: "",
    PRECIO: "",
    DESCRIPCION: "",
    IMAGEN_URL: "",
    NOTA_ACTUAL: "",
    ADVERTENCIA: ""
  });

  const navigate = useNavigate();

  const fetchProductos = () => {
    axios
      .get("http://localhost:5001/api/productos_crud")
      .then(res => setProductos(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleInsert = (e) => {
    e.preventDefault();
    if (!newProd.NOMBRE || !newProd.PRECIO) {
      alert("Por favor completa al menos el nombre y precio");
      return;
    }

    axios
      .post("http://localhost:5001/api/productos_crud", newProd)
      .then(() => {
        alert("Producto insertado correctamente");
        setNewProd({
          ID_TIPO_PRO: "",
          NOMBRE: "",
          PRECIO: "",
          DESCRIPCION: "",
          IMAGEN_URL: "",
          NOTA_ACTUAL: "",
          ADVERTENCIA: ""
        });
        fetchProductos();
      })
      .catch((err) => console.error("Error al insertar producto", err));
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    axios
      .put(`http://localhost:5001/api/productos_crud/${editProd.ID_PRODUCTO}`, editProd)
      .then(() => {
        alert("Producto actualizado correctamente");
        setEditProd(null);
        fetchProductos();
      })
      .catch((err) => console.error("Error al actualizar producto", err));
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      axios
        .delete(`http://localhost:5001/api/productos_crud/product/${id}`)
        .then(() => {
          alert("Producto eliminado correctamente");
          fetchProductos();
        })
        .catch((err) => {
          console.error("Error al eliminar producto", err);
          alert("No se pudo eliminar el producto");
        });
    }
  };

  return (
    <div className="container mt-4">
      <h2>Gestión de Productos</h2>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID_PRODUCTO</th>
            <th>ID_TIPO_PRO</th>
            <th>NOMBRE</th>
            <th>PRECIO</th>
            <th>DESCRIPCION</th>
            <th>NOTA_ACTUAL</th>
            <th>IMAGEN_URL</th>
            <th>ADVERTENCIA</th>
            <th>ACCIONES</th>
            <th>VER</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => (
            <tr key={prod.ID_PRODUCTO}>
              <td>{prod.ID_PRODUCTO}</td>
              <td>{prod.ID_TIPO_PRODUCTO}</td>
              <td>{prod.NOMBRE}</td>
              <td>{prod.PRECIO}</td>
              <td>{prod.DESCRIPCION}</td>
              <td>{prod.NOTA_ACTUAL}</td>
              <td>{prod.IMAGEN_URL}</td>
              <td>{prod.ADVERTENCIA}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => setEditProd(prod)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(prod.ID_PRODUCTO)}
                >
                  Eliminar
                </button>
              </td>
              <td>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => {
                    navigate(`/crud_rece/${prod.ID_PRODUCTO}`);
                    setTimeout(() => window.location.reload(), 100);
                  }}
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={editProd ? handleUpdate : handleInsert} className="mt-4">
        <div className="row">
          {[
            { label: "ID_TIPO_PRO", key: "ID_TIPO_PRO" },
            { label: "NOMBRE", key: "NOMBRE" },
            { label: "PRECIO", key: "PRECIO" },
            { label: "DESCRIPCION", key: "DESCRIPCION" },
            { label: "IMAGEN_URL", key: "IMAGEN_URL" },
            { label: "NOTA_ACTUAL", key: "NOTA_ACTUAL" },
            { label: "ADVERTENCIA", key: "ADVERTENCIA" },
          ].map(({ label, key }) => (
            <div key={key} className="col-md-3 mb-2">
              <label>{label}</label>
              <input
                className="form-control"
                type="text"
                value={editProd ? editProd[key] : newProd[key]}
                onChange={(e) =>
                  editProd
                    ? setEditProd({ ...editProd, [key]: e.target.value })
                    : setNewProd({ ...newProd, [key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <button className="btn btn-primary me-2" type="submit">
          {editProd ? "Actualizar" : "Insertar"}
        </button>
        {editProd && (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setEditProd(null)}
          >
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
};
