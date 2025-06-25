import pool from '../config/db.js';

class InventoryModel {
  async getInventory() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(`CALL sp_get_inventory()`);
      return rows;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw new Error('No se pudo obtener el inventario.');
    } finally {
      conn.release();
    }
  }


  async getRawMaterialTypes() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(`CALL sp_get_material_types()`);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      conn.release();
    }
  }Ñ

  async getUnits() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(`CALL sp_get_units()`);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      conn.release();
    }
  }

  async updateQuantity(id, cantidad) {
    await pool.query(`CALL sp_update_quantity(?, ?)`, [id, cantidad]);
  }

  async updateRawMaterial(id, nombre, id_tipo_materia, id_unidad, descripcion) {
    await pool.query(`CALL sp_update_raw_material(?, ?, ?, ?, ?)`, 
      [id, nombre, id_tipo_materia, id_unidad, descripcion]);
    // Agregar manejo de errores o confirmación si es necesario.
  }

  async deleteInventory(id) {
      const [result] = await pool.query(`CALL sp_delete_inventory(?)`, [id]);

      return { message: 'Inventario eliminado correctamente' }; 
  }


  async addNewRawMaterial(nombre, tipoMateria, unidad, cantidad, descripcion, idAdministrador) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      const [result] = await conn.query(
        `CALL sp_add_new_raw_material(?, ?, ?, ?, ?, ?)`,
        [nombre, tipoMateria, unidad, cantidad, descripcion, idAdministrador]
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
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(`CALL sp_get_inventory_history()`);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      conn.release();
    }
  }

  async getInventorySummary() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(`CALL sp_get_inventory_summary()`);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      conn.release();
    }
  }
}

export default new InventoryModel();
