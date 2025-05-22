import ProductModel from "../models/productModel.js";

class ProductController {
  // Obtener todos los productos
  async getAllProducts(req, res) {
    try {
      const products = await ProductModel.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res
        .status(500)
        .json({ message: "Error al obtener productos", error: error.message });
    }
  }

  // Obtener un producto por ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductModel.getProductById(id);

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error al obtener producto:", error);
      res
        .status(500)
        .json({ message: "Error al obtener producto", error: error.message });
    }
  }

  // Obtener todas las categorías
  async getCategories(req, res) {
    try {
      const categories = await ProductModel.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      res
        .status(500)
        .json({ message: "Error al obtener categorías", error: error.message });
    }
  }

  // Filtrar productos por término de búsqueda y categoría
  async filterProducts(req, res) {
    try {
      const { search, category } = req.query;
      const products = await ProductModel.filterProducts(search, category);
      res.json(products);
    } catch (error) {
      console.error("Error al filtrar productos:", error);
      res
        .status(500)
        .json({ message: "Error al filtrar productos", error: error.message });
    }
  }

  // Obtener productos destacados
  async getFeaturedProducts(req, res) {
    try {
      const limit = req.query.limit ? Number.parseInt(req.query.limit) : 3;
      const products = await ProductModel.getFeaturedProducts(limit);
      res.json(products);
    } catch (error) {
      console.error("Error al obtener productos destacados:", error);
      res
        .status(500)
        .json({
          message: "Error al obtener productos destacados",
          error: error.message,
        });
    }
  }
}

export default new ProductController();
