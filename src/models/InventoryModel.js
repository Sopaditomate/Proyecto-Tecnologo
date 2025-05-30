import pool from '../config/db.js';

class InventoryModel {
  async getInventory() {
  const [rows] = await pool.query(`
    SELECT 
      inv.ID_INVENTARIO,
      inv.CANTIDAD,
      mat.NOMBRE AS MATERIA_PRIMA,
      uni.NOMBRE AS UNIDAD,
      uni.ID_UNIDAD,
      tip.NOMBRE AS TIPO,
      tip.ID_TIP_MATERIA,
      mat.DESCRIPCION
    FROM inventario inv
    JOIN materia_prima mat ON inv.ID_MATERIA = mat.ID_MATERIA
    JOIN unidad uni ON mat.ID_UNIDAD = uni.ID_UNIDAD
    JOIN tipo_materia tip ON mat.ID_TIP_MATERIA = tip.ID_TIP_MATERIA
  `);
  return rows;
  }


  

  async updateQuantity(id, cantidad) {
    const [result] = await pool.query(
      'UPDATE inventario SET CANTIDAD = ? WHERE ID_INVENTARIO = ?',
      [cantidad, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Registro no encontrado');
    }
  }

  async updateRawMaterial(id, nombre, id_tipo_materia, id_unidad, descripcion) {
    // Obtener ID_MATERIA desde el inventario
    const [[inventario]] = await pool.query(
      'SELECT ID_MATERIA FROM inventario WHERE ID_INVENTARIO = ?',
      [id]
    );

    if (!inventario) {
      throw new Error('Inventario no encontrado');
    }

    const idMateria = inventario.ID_MATERIA;

    // Actualizar materia_prima
    const [result] = await pool.query(
      `UPDATE materia_prima 
       SET NOMBRE = ?, ID_TIP_MATERIA = ?, ID_UNIDAD = ?, DESCRIPCION = ?
       WHERE ID_MATERIA = ?`,
      [nombre, id_tipo_materia, id_unidad, descripcion, idMateria]
    );

    if (result.affectedRows === 0) {
      throw new Error('Materia prima no actualizada');
    }
  }

  async deleteInventory(id) {
      const [result] = await pool.query('DELETE FROM inventario WHERE ID_INVENTARIO = ?', [id]);

      if (result.affectedRows === 0) {
          throw new Error('Inventario no encontrado');
      }

      return { message: 'Inventario eliminado correctamente' }; 
  }

  async getRawMaterialTypes() {
    const [rows] = await pool.query('SELECT ID_TIP_MATERIA, NOMBRE FROM tipo_materia');
    return rows;
  }

  async getUnits() {
    const [rows] = await pool.query('SELECT ID_UNIDAD, NOMBRE FROM unidad');
    return rows;
  }

  async addNewRawMaterial(nombre, tipoMateria, unidad, cantidad, descripcion, idAdministrador) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Insertar en MATERIA_PRIMA
        const [materiaResult] = await conn.query(
            "INSERT INTO materia_prima (NOMBRE, ID_TIP_MATERIA, ID_UNIDAD, DESCRIPCION) VALUES (?, ?, ?, ?)",
            [nombre, tipoMateria, unidad, descripcion]  // Asegúrate de incluir la descripción aquí
        );

        const idMateria = materiaResult.insertId;

        // 2. Insertar en INVENTARIO (sin DESCRIPCION)
        const [inventarioResult] = await conn.query(
            "INSERT INTO inventario (ID_MATERIA, CANTIDAD, ID_ADMINISTRADOR_NEGOCIO) VALUES (?, ?, ?)",
            [idMateria, cantidad, idAdministrador]
        );

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
  }


  async getInventoryHistory() {
    const [rows] = await pool.query(`
      SELECT h.ID_HYS_INVENTARIO, h.ID_INVENTARIO, h.ID_MATERIA, m.NOMBRE AS NOMBRE_MATERIA,
             h.CANTIDAD, h.TIPO_MOVIMIENTO, h.FECHA_MOVIMIENTO
      FROM historial_inventario h
      JOIN materia_prima m ON h.ID_MATERIA = m.ID_MATERIA
      ORDER BY h.FECHA_MOVIMIENTO DESC
    `);

    return rows;
  }

  async getInventorySummary() {
    const [rows] = await pool.query(`
      SELECT i.ID_MATERIA, m.NOMBRE AS NOMBRE_MATERIA, SUM(i.CANTIDAD) AS CANTIDAD_TOTAL, u.NOMBRE AS UNIDAD
      FROM inventario i
      JOIN materia_prima m ON i.ID_MATERIA = m.ID_MATERIA
      JOIN unidad u ON m.ID_UNIDAD = u.ID_UNIDAD
      GROUP BY i.ID_MATERIA, m.NOMBRE, u.NOMBRE
    `);

    return rows;
  }
}

export default new InventoryModel();
