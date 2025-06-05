import pool from '../config/db.js';

class ProductionModel {
  // Obtener todas las producciones (si quieres ver todo sin filtrar)
  async getAllProductions() {
    const [rows] = await pool.query(`
      SELECT 
        p.ID_PRODUCCION,
        p.CANTIDAD_PRODUCIR,
        p.FECHA_HORA,
        ep.NOMBRE AS ESTADO_PRODUCCION,
        pr.NOMBRE AS PRODUCTO,
        pr.PRECIO,
        pr.IMAGEN_URL
      FROM produccion p
      JOIN estado_produccion ep ON p.ID_ESTADO_PRODUCCION = ep.ID_ESTADO_PRODUCCION
      JOIN producto pr ON p.ID_PRODUCTO = pr.ID_PRODUCTO
      ORDER BY p.FECHA_HORA DESC
    `);
    return rows;
  }

  // Obtener por estado ('En Produccion' o 'Finalizado')
  async getProductionsByStatus(statusName) {
    const [rows] = await pool.query(`
      SELECT 
        p.ID_PRODUCCION,
        p.CANTIDAD_PRODUCIR,
        p.FECHA_HORA,
        pr.NOMBRE AS PRODUCTO,
        pr.PRECIO,
        pr.IMAGEN_URL
      FROM produccion p
      JOIN estado_produccion ep ON p.ID_ESTADO_PRODUCCION = ep.ID_ESTADO_PRODUCCION
      JOIN producto pr ON p.ID_PRODUCTO = pr.ID_PRODUCTO
      WHERE ep.NOMBRE = ?
      ORDER BY p.FECHA_HORA DESC
    `, [statusName]);

    return rows;
  }

  // Cambiar estado de producción (por ejemplo de "En Producción" a "Finalizado")
  async updateProductionStatus(idProduccion, nuevoEstado) {
    // Primero obtenemos el ID del estado
    const [[estado]] = await pool.query(
      'SELECT ID_ESTADO_PRODUCCION FROM estado_produccion WHERE NOMBRE = ?',
      [nuevoEstado]
    );

    if (!estado) throw new Error('Estado no válido');

    const idEstado = estado.ID_ESTADO_PRODUCCION;

    const [result] = await pool.query(
      'UPDATE produccion SET ID_ESTADO_PRODUCCION = ? WHERE ID_PRODUCCION = ?',
      [idEstado, idProduccion]
    );

    if (result.affectedRows === 0) {
      throw new Error('Producción no encontrada');
    }

    return { message: 'Estado actualizado correctamente' };
  }

  // Crear una nueva producción
  // constraint para un default de en produccion
  async createProduction(idProducto, cantidad, estado = 'En Produccion') {
    const idAdministrador = 1000000; // Solo hay uno, lo ponemos fijo

    const [[estadoProd]] = await pool.query(
      'SELECT ID_ESTADO_PRODUCCION FROM estado_produccion WHERE NOMBRE = ?',
      [estado]
    );

    if (!estadoProd) throw new Error('Estado de producción no válido');

    const [result] = await pool.query(
      `INSERT INTO produccion (ID_ADMINISTRADOR_NEGOCIO, ID_PRODUCTO, ID_ESTADO_PRODUCCION, CANTIDAD_PRODUCIR)
       VALUES (?, ?, ?, ?)`,
      [idAdministrador, idProducto, estadoProd.ID_ESTADO_PRODUCCION, cantidad]
    );

    return { message: 'Producción creada', id: result.insertId };
  }


  async createProductionsBatch(producciones) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [[estadoProd]] = await conn.query(
        'SELECT ID_ESTADO_PRODUCCION FROM estado_produccion WHERE NOMBRE = ?',
        ['En Produccion']
        );

        if (!estadoProd) throw new Error('Estado de producción no válido');

        const idEstado = estadoProd.ID_ESTADO_PRODUCCION;
        const idAdministrador = 1000000; // fijo

        for (const prod of producciones) {
        const { idProducto, cantidad } = prod;

        await conn.query(
            `INSERT INTO produccion (ID_ADMINISTRADOR_NEGOCIO, ID_PRODUCTO, ID_ESTADO_PRODUCCION, CANTIDAD_PRODUCIR)
            VALUES (?, ?, ?, ?)`,
            [idAdministrador, idProducto, idEstado, cantidad]
        );
        }

        await conn.commit();
        return { message: 'Producciones insertadas correctamente' };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
    }

    async updateProductionsStatusBatch(idsProduccion = [], nuevoEstado) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Obtener ID del nuevo estado
    const [[estado]] = await conn.query(
      'SELECT ID_ESTADO_PRODUCCION FROM estado_produccion WHERE NOMBRE = ?',
      [nuevoEstado]
    );

    if (!estado) throw new Error('Estado no válido');

    const idEstado = estado.ID_ESTADO_PRODUCCION;

    for (const id of idsProduccion) {
      const [result] = await conn.query(
        'UPDATE produccion SET ID_ESTADO_PRODUCCION = ? WHERE ID_PRODUCCION = ?',
        [idEstado, id]
      );

      if (result.affectedRows === 0) {
        throw new Error(`Producción con ID ${id} no encontrada`);
      }
    }

    await conn.commit();
    return { message: 'Estados actualizados correctamente' };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}


async deleteProductionsBatch(idsProduccion = []) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const id of idsProduccion) {
      const [result] = await conn.query(
        'DELETE FROM produccion WHERE ID_PRODUCCION = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        throw new Error(`Producción con ID ${id} no encontrada`);
      }
    }

    await conn.commit();
    return { message: 'Producciones eliminadas correctamente' };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}


}

export default new ProductionModel();