// Configuración de menús para diferentes secciones de la aplicación

// Elementos del menú principal
export const menuItems = [
  { name: "Inicio", path: "/", icon: "/assets/house.svg" },
  {
    name: "Catalogo",
    path: "/catalogo",
    icon: "/assets/baguette-catalog.svg",
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
//aun falta por trabajar
export const getHeaderItems = (type) => {
  // Elementos comunes en todas las páginas
  const commonItems = [
    { name: "Inicio", path: "/" },
    { name: "Catálogo", path: "/catalogo" },
    { name: "Contacto" },
    { name: "Otro" },
  ];

  // Devolver elementos según el tipo de página
  return commonItems;
};

// Obtener elementos del menú según el tipo de página
export const getMenuItems = (UserType) => {
  switch (UserType) {
    case "catalog": //se hizo un pequeño cambio en catalogo respecto a las rutas y es que quito la parte de cuenta
      return [
        { name: "Inicio", path: "/" },
        { name: "Catalogo", path: "/catalogo" },
        { name: "Contacto" },
        { name: "Perfil", path: "/profile" }, // <-- AGREGA ESTO
        { name: "Cerrar Sesion" },
      ];
    case "login":
      return [
        { name: "Inicio", icon: "/assets/house.svg", path: "/" },
        {
          name: "Catalogo",
          path: "/catalogo",
          icon: "/assets/baguette-catalog.svg",
        },
        {
          name: "Perfil",
          path: "/profile",
          icon: "/assets/profileiconwhite.svg",
        }, // <-- CAMBIA "Cuenta" por "Perfil" y agrega path
        { name: "Contacto", icon: "/assets/contact.svg" },
        {
          name: "Cerrar Sesion",
          icon: "/assets/log-out.svg",
        },
      ];
    case "admin": //opciones para el modulo de admin
      return [
        {
          name: "Panel",
          path: "/admin",
        },
        {
          name: "Gestión de Usuarios",
          path: "/admin/users",
        },
        {
          name: "Gestión de Pedidos",
          path: "/admin/orders",
        },
        {
          name: "Productos",
          path: "/admin/products",
        },
        {
          name: "Produccion",
          path: "/admin/productions",
        },
        {
          name: "Inventario",
          path: "/admin/inventory",
        },
        {
          name: "Cerrar Sesion",
          icon: "/assets/log-out.svg",
        },
      ];
    default:
      return menuItems;
  }
};
