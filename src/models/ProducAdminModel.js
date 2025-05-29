import pool from "../config/db.js"; // importas el pool correctamente

class ProductAdminModel {
  async getProduct() {
    const [rows] = await pool.query(`
      SELECT 
      p.ID_PRODUCTO,
      t.ID_TIPO_PRO,
      p.NOMBRE,
      p.PRECIO,
      p.DESCRIPCION,
      p.IMAGEN_URL,
      p.NOTA_ACTUAL,
      p.ADVERTENCIA
      FROM producto p
      JOIN tipo_producto t ON p.ID_TIPO_PRO = t.ID_TIPO_PRO
      `);
    return rows;
  }


  async UpdateProduct(id,ID_TIPO_PRO, NOMBRE, PRECIO, DESCRIPCION, IMAGEN_URL, NOTA_ACTUAL, ADVERTENCIA) {
    const [producto] = await pool.query(`UPDATE producto 
       SET ID_TIPO_PRO = ?, NOMBRE = ?, PRECIO = ?, DESCRIPCION = ?, IMAGEN_URL = ?, NOTA_ACTUAL = ?, ADVERTENCIA = ? 
       WHERE ID_PRODUCTO = ?`,
      [
        ID_TIPO_PRO,
        NOMBRE,
        PRECIO,
        DESCRIPCION,
        IMAGEN_URL,
        NOTA_ACTUAL,
        ADVERTENCIA,
        id,
      ]
    );

    if (producto.affectedRows === 0) {
      throw new error('producto no encontrado');
    }
  }


  async DeleteProduct(id) {
    const [result] = await pool.query(`
      DELETE FROM producto WHERE ID_PRODUCTO = ?`, [id]);

    if (result.affectedRows === 0) {
      throw new error('producto no encontrado');
    }
  }

  async AddProduct(ID_TIPO_PRO, NOMBRE, PRECIO, DESCRIPCION, IMAGEN_URL, NOTA_ACTUAL, ADVERTENCIA) {
    const [producto] = await pool.query("INSERT INTO producto (ID_TIPO_PRO, NOMBRE, PRECIO, DESCRIPCION, IMAGEN_URL, NOTA_ACTUAL, ADVERTENCIA) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        ID_TIPO_PRO,
        NOMBRE,
        PRECIO,
        DESCRIPCION,
        IMAGEN_URL,
        NOTA_ACTUAL,
        ADVERTENCIA,
      ]
    );

    if (producto.affectedRows === 0) {
      throw new error('producto no creado');
    }
  }

}
export default new ProductAdminModel();



