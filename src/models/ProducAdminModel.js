import pool from "../config/db.js"; // importas el pool correctamente

class ProductAdminModel {
  async getProduct() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(`SELECT * FROM vw_active_product_admin`);
      return rows;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("No se pudo obtener los productos.");
    } finally {
      conn.release();
    }
  }

  async UpdateProduct(
    ID_PRODUCTO,
    ID_TIPO_PRO,
    NOMBRE_PROD,
    PRECIO,
    DESCRIPCION,
    IMAGEN_URL,
    NOTA_ACTUAL,
    ADVERTENCIA
  ) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("CALL sp_update_product_admin(?, ?, ?, ?, ?, ?, ?, ?)", [
        ID_PRODUCTO,
        ID_TIPO_PRO,
        NOMBRE_PROD,
        PRECIO,
        DESCRIPCION,
        IMAGEN_URL,
        NOTA_ACTUAL,
        ADVERTENCIA,
      ]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      if (err.sqlState === "45000") {
        throw new Error(err.message);
      }
      console.error("Error updating product:", err);
      throw new Error("No se pudo actualizar el producto.");
    } finally {
      conn.release();
    }
  }

  async DeleteProduct(id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("CALL sp_delete_product_admin(?)", [id]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      if (err.sqlState === "45000") {
        throw new Error(err.message);
      }
      console.error("Error deleting product:", err);
      throw new Error("No se pudo eliminar el producto.");
    } finally {
      conn.release();
    }
  }

  async AddProduct(
    ID_TIPO_PRO,
    NOMBRE_PROD,
    PRECIO,
    DESCRIPCION,
    IMAGEN_URL,
    NOTA_ACTUAL,
    ADVERTENCIA
  ) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("CALL sp_insert_product_admin(?, ?, ?, ?, ?, ?, ?)", [
        ID_TIPO_PRO,
        NOMBRE_PROD,
        PRECIO,
        DESCRIPCION,
        IMAGEN_URL,
        NOTA_ACTUAL,
        ADVERTENCIA,
      ]);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      console.error("Error adding product:", error);
      throw new Error("No se pudo crear el producto.");
    } finally {
      conn.release();
    }
  }

  async addProductToCart(id_catalog, id_product, discount) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("CALL sp_insert_product_carrito_admin(?, ?, ?)", [
        id_catalog,
        id_product,
        discount,
      ]);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      console.error("Error adding product to cart:", error);
      throw new Error("No se pudo agregar el producto al carrito.");
    } finally {
      conn.release();
    }
  }

  async ActivateProduct(id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("CALL sp_activate_product_admin(?)", [id]);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      console.error("Error activating product:", error);
      throw new Error("No se pudo activar el producto.");
    } finally {
      conn.release();
    }
  }
  async cargarMasivaDesdeCSV(registros) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const row of registros) {
      const {
        ID_TIPO_PRO,
        NOMBRE,
        PRECIO,
        DESCRIPCION,
        IMAGEN_URL,
        NOTA_ACTUAL,
        ADVERTENCIA
      } = row;

      if (!NOMBRE || !ID_TIPO_PRO || !PRECIO || !IMAGEN_URL || !NOTA_ACTUAL || !ADVERTENCIA) continue;

      await conn.query(
        `CALL sp_insert_massive_product_admin(?, ?, ?, ?, ?, ?, ?)`,
        [ID_TIPO_PRO, NOMBRE, PRECIO, DESCRIPCION, IMAGEN_URL, NOTA_ACTUAL, ADVERTENCIA]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    console.error('Error en cargaMasivaDesdeCSV:', error);
    throw error;
  } finally {
    conn.release();
  }
}

}
export default new ProductAdminModel();
