// Controlador para gestionar productos y filtros
import {
  products,
  filterProducts,
  getUniqueCategories,
} from "../models/ProductsData";

// Obtener todos los productos
export const getAllProducts = () => {
  return products;
};

// Obtener producto por ID
export const getProductById = (id) => {
  return products.find((product) => product.id === id);
};

// Filtrar productos por término de búsqueda y categoría
export const getFilteredProducts = (searchTerm, category) => {
  return filterProducts(searchTerm, category);
};

// Obtener todas las categorías únicas
export const getAllCategories = () => {
  return getUniqueCategories();
};

// Obtener productos destacados (para la página de inicio)
export const getFeaturedProducts = (limit = 3) => {
  return products.sort((a, b) => b.rating - a.rating).slice(0, limit);
};
