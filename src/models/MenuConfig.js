// Configuración de menús para diferentes secciones de la aplicación

// Elementos del menú principal
export const menuItems = [
  { name: "Inicio", path: "/", icon: "/assets/house.svg" },
  {
    name: "Catalogo",
    path: "/catalogo",
    icon: "/assets/baguette-catalog.svg",
  },
  {
    name: "Servicios",
    path: "",
    icon: "/assets/services.svg",
  },
  { name: "Contacto", icon: "/assets/contact.svg" },
];

// Iconos predeterminados para el encabezado
export const defaultIcons = {
  iconMenu: "/assets/hamburgermenu.svg",
  icon1: "/images/logo-proyecto.jpg",
  icon2: "/assets/shoppingcar.svg",
  link2: "/shoppingCart",
};

// Obtener elementos del encabezado según el tipo de página
export const getHeaderItems = (type) => {
  // Elementos comunes en todas las páginas
  const commonItems = [
    { name: "Inicio", path: "/" },
    { name: "Catálogo", path: "/catalogo" },
    { name: "Servicios" },
    { name: "Contacto" },
    { name: "Otro" },
  ];

  // Devolver elementos según el tipo de página
  return commonItems;
};

// Obtener elementos del menú según el tipo de página
export const getMenuItems = (type) => {
  switch (type) {
    case "catalog":
      return [
        { name: "Inicio", icon: "/assets/house.svg", path: "/" },
        { name: "Cuenta", icon: "/assets/profileiconwhite.svg" },
        {
          name: "Carrito",
          path: "/shoppingCart",
          icon: "/assets/shoppingcar.svg",
        },
        { name: "Contacto", icon: "/assets/contact.svg" },
        { name: "Cerrar Sesion", icon: "/assets/log-out.svg" },
      ];
    case "login":
      return [
        { name: "Inicio", icon: "/assets/house.svg", path: "/" },
        {
          name: "Catalogo",
          path: "/catalogo",
          icon: "/assets/baguette-catalog.svg",
        },
        { name: "Cuenta", icon: "/assets/profileiconwhite.svg" },
        { name: "Contacto", icon: "/assets/contact.svg" },
        { name: "Cerrar Sesion", icon: "/assets/log-out.svg" },
      ];
    default:
      return menuItems;
  }
};
