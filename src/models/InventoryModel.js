import pool from '../config/db.js';

class InventoryModel {
  async getInventory() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(`SELECT * FROM vw_active_inventory`);
      return rows;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw new Error('No se pudo obtener el inventario.');
    } finally {
      conn.release();
    }
  }


  async getInventoryByUnitType(unitType) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT * FROM vw_active_inventory WHERE id_unit = ?`,
        [unitType]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw new Error('No se pudo obtener el inventario por unidad.');
    } finally {
      conn.release();
    }
  }


  async getRawMaterialTypes() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(`SELECT * FROM vw_active_material_types`);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      conn.release();
    }
  }

  async getUnits() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(`SELECT * FROM vw_active_units`);
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
      const [rows] = await conn.query(`SELECT * FROM vw_active_inventory_history`);
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

  async cargarDesdeCSV(registros) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      for (const row of registros) {
        const {
          id_material_type,
          name,
          description,
          id_unit,
          id_user,
          quantity
        } = row;

        // Asegúrate de que los datos sean válidos
        if (!name || !id_material_type || !id_unit || !quantity || !id_user) continue;

        await conn.query(
          `CALL sp_add_new_raw_material(?, ?, ?, ?, ?, ?)`,
          [name, id_material_type, id_unit, quantity, description || '', id_user]
        );
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      console.error('Error en cargaDesdeCSV:', error);
      throw error;
    } finally {
      conn.release();
    }
  }
}

export default new InventoryModel();
