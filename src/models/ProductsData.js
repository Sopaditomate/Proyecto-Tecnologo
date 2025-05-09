// Datos de productos para la tienda

// Lista de productos disponibles
export const products = [
  {
    id: 1,
    nameProduct: "Pan de Masa Madre",
    description: "Pan artesanal de masa madre con fermentación natural ",
    price: 5.0,
    image: "/images/pandemasamadre.png",
    rating: 4.5,
    category: "Artesanal",
  },
  {
    id: 2,
    nameProduct: "Pan Blanco",
    description: "Pan tradicional de harina de trigo, suave y esponjoso",
    price: 8.0,
    image: "/images/panblanco.jpg",
    rating: 4.0,
    category: "Tradicional",
  },
  {
    id: 3,
    nameProduct: "Croissant de Chocolate",
    description: "Croissant de mantequilla relleno de chocolate belga",
    price: 9.0,
    image: "/images/croissantdechocolate.jpg",
    rating: 4.8,
    category: "Dulce",
  },
  {
    id: 4,
    nameProduct: "Pan de Masa Madre Integral",
    description: "Pan artesanal de masa madre con harina integral",
    price: 7.0,
    image: "/images/pandemasamadre2.jpg",
    rating: 4.3,
    category: "Artesanal",
  },
  {
    id: 5,
    nameProduct: "Pan de Masa Madre con Semillas",
    description: "Pan artesanal con mezcla de semillas nutritivas",
    price: 5.5,
    image: "/images/bagguete.jpg",
    rating: 4.2,
    category: "Artesanal",
  },
  {
    id: 6,
    nameProduct: "Baguette",
    description: "Baguette tradicional francesa con corteza crujiente",
    price: 10.0,
    image: "/images/panintegral.jpg",
    rating: 4.7,
    category: "Tradicional",
  },
];

// Obtener categorías únicas de los productos
export const getUniqueCategories = () => {
  return [
    "Todos",
    ...new Set(products.map((product) => product.category || "Sin categoría")),
  ];
};

// Filtrar productos por término de búsqueda y categoría
export const filterProducts = (searchTerm, selectedCategory) => {
  return products.filter((product) => {
    const matchesSearch =
      product.nameProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || selectedCategory === product.category;
    return matchesSearch && matchesCategory;
  });
};
