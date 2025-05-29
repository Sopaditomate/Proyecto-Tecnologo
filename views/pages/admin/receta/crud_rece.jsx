import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export function Recetasform() {
  const [recetas, setRecetas] = useState([]);
  const [editReceta, setEditReceta] = useState(null);
  const [formData, setFormData] = useState({
    ID_MATERIA: "",
    CANTIDAD_USAR: ""
  });
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();

  // Fetch all recipes for the specific product
  const fetchRecetas = () => {
    axios
      .get(`http://localhost:5001/api/recetas_crud/${id}`)
      .then((res) => setRecetas(res.data))
      .catch((err) => console.error("Error al cargar las recetas:", err));
  };

  useEffect(() => {
    if (id) {
      fetchRecetas(); // Fetch recipes when the ID changes
    }
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new recipe
  const handleInsert = (e) => {
    e.preventDefault();
    if (!formData.ID_MATERIA || !formData.CANTIDAD_USAR) {
      alert("Por favor complete todos los campos");
      return;
    }

    axios
      .post(`http://localhost:5001/api/recetas_crud/${id}`, formData)
      .then(() => {
        alert("Receta agregada correctamente");
        setFormData({ ID_MATERIA: "", CANTIDAD_USAR: "" });
        fetchRecetas();
      })
      .catch((err) => console.error("Error al agregar receta:", err));
  };

  // Handle updating a selected recipe
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.ID_MATERIA || !formData.CANTIDAD_USAR) {
      alert("Por favor complete todos los campos");
      return;
    }

    axios
      .put(`http://localhost:5001/api/recetas_crud/${editReceta.ID_RECETA}`, {
        ...formData,
        ID_PRODUCTO: editReceta.ID_PRODUCTO,
      })
      .then(() => {
        alert("Receta actualizada correctamente");
        setEditReceta(null);
        setFormData({ ID_MATERIA: "", CANTIDAD_USAR: "" });
        fetchRecetas();
      })
      .catch((err) => console.error("Error al actualizar receta:", err));
  };

  // Handle deleting a recipe
  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta receta?")) {
      axios
        .delete(`http://localhost:5001/api/recetas_crud/${id}`)
        .then(() => {
          alert("Receta eliminada correctamente");
          fetchRecetas();
        })
        .catch((err) => {
          console.error("Error al eliminar receta", err);
          alert("No se pudo eliminar la receta");
        });
    }
  };

  // Handle going back to the previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mt-4">
      <h2>Recetas del Producto #{id}</h2>
      <button className="btn btn-secondary mb-3" onClick={handleGoBack}>
        Volver
      </button>

      {/* Table displaying recipes */}
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>ID RECETA</th>
            <th>ID PRODUCTO</th>
            <th>ID MATERIA</th>
            <th>CANTIDAD USAR</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {recetas.map((receta) => (
            <tr key={receta.ID_RECETA}>
              <td>{receta.ID_RECETA}</td>
              <td>{receta.ID_PRODUCTO}</td>
              <td>{receta.ID_MATERIA}</td>
              <td>{receta.CANTIDAD_USAR}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => {
                    setEditReceta(receta);
                    setFormData({
                      ID_MATERIA: receta.ID_MATERIA,
                      CANTIDAD_USAR: receta.CANTIDAD_USAR,
                    });
                  }}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(receta.ID_RECETA)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form for adding or editing a recipe */}
      <div className="mt-4">
        <h4>{editReceta ? `Editar Receta ID: ${editReceta.ID_RECETA}` : `Agregar nueva receta al producto #${id}`}</h4>
        <form onSubmit={editReceta ? handleUpdate : handleInsert}>
          <div className="mb-2">
            <label>ID MATERIA</label>
            <input
              className="form-control"
              type="number"
              name="ID_MATERIA"
              value={formData.ID_MATERIA}
              onChange={handleChange}
            />
          </div>
          <div className="mb-2">
            <label>CANTIDAD USAR</label>
            <input
              className="form-control"
              type="number"
              name="CANTIDAD_USAR"
              value={formData.CANTIDAD_USAR}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {editReceta ? "Actualizar" : "Agregar Receta"}
          </button>
          {editReceta && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => setEditReceta(null)}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
