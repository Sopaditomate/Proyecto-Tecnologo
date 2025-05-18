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
    image: "/images/croissant-relleno-de-chocolate.jpg",
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
    image: "/images/pan-de-multicereales-gallofa.jpg",
    rating: 4.2,
    category: "Artesanal",
  },
  {
    id: 6,
    nameProduct: "Pan de Masa Madre Clásico",
    description:
      "Fermentado naturalmente, con corteza crujiente y miga aireada. Sabor profundo y ligeramente ácido, ideal para tostadas o sandwiches.",
    price: 10.0,
    image: "/images/Classic_Sourdough_bread.jpeg",
    rating: 4.7,
    category: "Tradicional",
  },
  {
    id: 7,
    nameProduct: "Pan de Avena Integral",
    description:
      "Elaborado con avena integral, rico en fibra y sabor suave. Ideal para desayunos saludables",
    price: 8.0,
    image:
      "https://media.istockphoto.com/id/484013707/photo/loaf-of-bread.jpg?s=612x612&w=0&k=20&c=irE1mzL4GPte0pAih0gUslgUBuDBcM1diRrwZueC4kM=",
    rating: 4.5,
    category: "Saludable",
  },
  {
    id: 8,
    nameProduct: "Pan de Centeno con Masa Madre",
    description:
      "Hecho con harina de centeno y fermentado con masa madre, sabor profundo y textura densa.",
    price: 9.5,
    image:
      "https://cdn.pixabay.com/photo/2016/06/26/16/50/bread-1480741_1280.jpg",
    rating: 4.6,
    category: "Rústico",
  },
  {
    id: 9,
    nameProduct: "Rollos de Canela",
    description:
      "Deliciosos rollos de canela caseros, con una masa suave y esponjosa, rellenos de canela y azúcar moreno, y glaseados con un toque dulce. Perfectos para acompañar el café o disfrutar como postre.",
    price: 8.5,
    image:
      "https://cdn.pixabay.com/photo/2016/05/26/16/27/cinnamon-rolls-1417494_1280.jpg",
    rating: 4.8,
    category: "Dulce",
  },
  {
    id: 10,
    nameProduct: "Pan de Ajo",
    description:
      "Pan crujiente por fuera y suave por dentro, infusionado con mantequilla, ajo fresco y hierbas aromáticas. Ideal como acompañamiento para pastas, sopas o como aperitivo.",
    price: 6.5,
    image:
      "https://cdn.pixabay.com/photo/2015/03/06/12/14/garlic-bread-661578_1280.jpg",
    rating: 4.9,
    category: "Saborizado",
  },
  {
    id: 11,
    nameProduct: "Baguette Tradicional",
    description:
      "Clásica baguette francesa con corteza dorada y crujiente, y una miga suave y ligera. Perfecta para hacer bocadillos, acompañar tablas de quesos o disfrutar con aceite de oliva.",
    price: 7.0,
    image:
      "https://cdn.pixabay.com/photo/2018/08/20/10/57/bread-3618640_1280.jpg",
    rating: 4.8,
    category: "Tradicional",
  },
  {
    id: 12,
    nameProduct: "Croissant Clásico ",
    description:
      "Croissant hojaldrado y dorado, elaborado con mantequilla de alta calidad. Su textura crujiente por fuera y suave por dentro lo convierte en un clásico irresistible del desayuno francés.",
    price: 5.5,
    image:
      "https://cdn.pixabay.com/photo/2019/09/29/19/20/sweet-4514136_1280.jpg",
    rating: 4.9,
    category: "Dulce",
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
