import pool from "../config/db.js";

class ProductModel {
  // Obtener todos los productos del catálogo
  async getAllProducts() {
    try {
      const [[rows]] = await pool.query("CALL sp_get_all_products()");
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
      const [[rows]] = await pool.query("CALL sp_get_product_by_id(?)", [id]);
      if (!rows.length) return null;
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
      const [[rows]] = await pool.query("CALL sp_get_categories()");
      return [
        { id: 0, nombre: "Todos" },
        ...rows.map((row) => ({
          id: row.ID,
          nombre: row.NOMBRE,
        })),
      ];
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      throw error;
    }
  }

  // Filtrar productos por término de búsqueda y categoría
  async filterProducts(searchTerm, selectedCategory) {
    try {
      const [[rows]] = await pool.query("CALL sp_filter_products(?, ?)", [
        searchTerm || null,
        selectedCategory || null,
      ]);
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
      const [[rows]] = await pool.query("CALL sp_get_featured_products(?)", [
        limit,
      ]);
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

  static async ActivateProduct(id) {
    // Cambia el estado del producto a activo (1)
    await pool.query("UPDATE product SET id_state = 1 WHERE id = ?", [id]);
  }
}

export default new ProductModel();
