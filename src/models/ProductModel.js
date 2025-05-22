import pool from "../config/db.js";

class ProductModel {
  // Obtener todos los productos del catálogo
  async getAllProducts() {
    try {
      const [rows] = await pool.query(`
        SELECT p.ID_PRODUCTO as id, p.NOMBRE as nameProduct, p.DESCRIPCION as description, 
               p.PRECIO as price, p.IMAGEN_URL as image, p.NOTA_ACTUAL as rating, 
               tp.NOMBRE as category, c.DESCUENTO as discount
        FROM producto p
        JOIN tipo_producto tp ON p.ID_TIPO_PRO = tp.ID_TIPO_PRO
        JOIN catalogo c ON p.ID_PRODUCTO = c.ID_PRODUCTO
      `);

      // Asegurarse de que los valores numéricos sean correctos
      return rows.map((product) => ({
        ...product,
        price: product.price ? Number(product.price) : 0,
        rating:
          product.rating !== null && product.rating !== undefined
            ? Number(product.rating)
            : null,
        discount: product.discount ? Number(product.discount) : 0,
      }));
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  }

  // Obtener un producto por ID
  async getProductById(id) {
    try {
      const [rows] = await pool.query(
        `
        SELECT p.ID_PRODUCTO as id, p.NOMBRE as nameProduct, p.DESCRIPCION as description, 
               p.PRECIO as price, p.IMAGEN_URL as image, p.NOTA_ACTUAL as rating, 
               tp.NOMBRE as category, c.DESCUENTO as discount
        FROM producto p
        JOIN tipo_producto tp ON p.ID_TIPO_PRO = tp.ID_TIPO_PRO
        JOIN catalogo c ON p.ID_PRODUCTO = c.ID_PRODUCTO
        WHERE p.ID_PRODUCTO = ?
      `,
        [id]
      );

      if (!rows.length) return null;

      // Asegurarse de que los valores numéricos sean correctos
      const product = rows[0];
      return {
        ...product,
        price: product.price ? Number(product.price) : 0,
        rating:
          product.rating !== null && product.rating !== undefined
            ? Number(product.rating)
            : null,
        discount: product.discount ? Number(product.discount) : 0,
      };
    } catch (error) {
      console.error("Error al obtener producto por ID:", error);
      throw error;
    }
  }

  // Obtener categorías únicas
  async getCategories() {
    try {
      const [rows] = await pool.query(`
        SELECT NOMBRE FROM tipo_producto
      `);
      return ["Todos", ...rows.map((row) => row.NOMBRE)];
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      throw error;
    }
  }

  // Filtrar productos por término de búsqueda y categoría
  async filterProducts(searchTerm, selectedCategory) {
    try {
      let query = `
        SELECT p.ID_PRODUCTO as id, p.NOMBRE as nameProduct, p.DESCRIPCION as description, 
               p.PRECIO as price, p.IMAGEN_URL as image, p.NOTA_ACTUAL as rating, 
               tp.NOMBRE as category, c.DESCUENTO as discount
        FROM producto p
        JOIN tipo_producto tp ON p.ID_TIPO_PRO = tp.ID_TIPO_PRO
        JOIN catalogo c ON p.ID_PRODUCTO = c.ID_PRODUCTO
        WHERE 1=1
      `;

      const params = [];

      if (searchTerm) {
        query += ` AND (p.NOMBRE LIKE ? OR p.DESCRIPCION LIKE ?)`;
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }

      if (selectedCategory && selectedCategory !== "Todos") {
        query += ` AND tp.NOMBRE = ?`;
        params.push(selectedCategory);
      }

      const [rows] = await pool.query(query, params);

      // Asegurarse de que los valores numéricos sean correctos
      return rows.map((product) => ({
        ...product,
        price: product.price ? Number(product.price) : 0,
        rating:
          product.rating !== null && product.rating !== undefined
            ? Number(product.rating)
            : null,
        discount: product.discount ? Number(product.discount) : 0,
      }));
    } catch (error) {
      console.error("Error al filtrar productos:", error);
      throw error;
    }
  }

  // Obtener productos destacados por calificación
  async getFeaturedProducts(limit = 3) {
    try {
      const [rows] = await pool.query(
        `
        SELECT p.ID_PRODUCTO as id, p.NOMBRE as nameProduct, p.DESCRIPCION as description, 
               p.PRECIO as price, p.IMAGEN_URL as image, p.NOTA_ACTUAL as rating, 
               tp.NOMBRE as category, c.DESCUENTO as discount
        FROM producto p
        JOIN tipo_producto tp ON p.ID_TIPO_PRO = tp.ID_TIPO_PRO
        JOIN catalogo c ON p.ID_PRODUCTO = c.ID_PRODUCTO
        ORDER BY p.NOTA_ACTUAL DESC
        LIMIT ?
      `,
        [limit]
      );

      // Asegurarse de que los valores numéricos sean correctos
      return rows.map((product) => ({
        ...product,
        price: product.price ? Number(product.price) : 0,
        rating:
          product.rating !== null && product.rating !== undefined
            ? Number(product.rating)
            : null,
        discount: product.discount ? Number(product.discount) : 0,
      }));
    } catch (error) {
      console.error("Error al obtener productos destacados:", error);
      throw error;
    }
  }
}

export default new ProductModel();
