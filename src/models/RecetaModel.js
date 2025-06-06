import pool from "../config/db.js"; // Importa el pool correctamente

class RecetasModel {

  async GetReceta(id) {
    const [rows] = await pool.query(`
    SELECT 
    r.ID_RECETA,
    p.ID_PRODUCTO,
    p.NOMBRE as NOMBRE_PROD,
    m.NOMBRE as NOMBRE_MATE,
    m.ID_MATERIA,
    r.CANTIDAD_USAR
    FROM recetas r 
    JOIN producto p ON p.ID_PRODUCTO = r.ID_PRODUCTO
    JOIN materia_prima m ON m.ID_MATERIA = r.ID_MATERIA 
    WHERE r.ID_PRODUCTO = ? `, [id]);
    return rows;
  }

async UpdateReceta(id, ID_MATERIA, CANTIDAD_USAR) {
  const [result] = await pool.query(
    `UPDATE recetas SET ID_MATERIA = ?, CANTIDAD_USAR = ? WHERE ID_RECETA = ?`,
    [ID_MATERIA, CANTIDAD_USAR, id]
  );

  if (result.affectedRows === 0) {
    throw new Error("Receta no encontrada");
  }
}

  async DeleteReceta(id) {
    const [producto] = await pool.query(`DELETE FROM recetas WHERE ID_RECETA = ?`, [id]);

    if (producto.affectedRows === 0) {
      throw new error(" producto no encontrado")
    }
  }

  async AddReceta(ID_PRODUCTO, ID_MATERIA, CANTIDAD_USAR) {
    const [producto] = await pool.query(`INSERT INTO recetas (ID_PRODUCTO, ID_MATERIA, CANTIDAD_USAR) VALUES (?, ?, ?)`,
      [ID_PRODUCTO, ID_MATERIA, CANTIDAD_USAR]);
    if (producto.affectedRows === 0) {
      throw new error("producto no encontrado");

    }
    return producto.insertId
  }
}
export default new RecetasModel();

























