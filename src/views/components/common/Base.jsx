// Componente Base: Muestra un encabezado con el título y la descripción de la página
export function Base({ namePage, description }) {
  // Si no se pasa ni el 'namePage' ni el 'description', no se renderiza nada
  if (!namePage && !description) {
    return null;
  }

  return (
    // Contenedor del encabezado
    <header id="base-cta">
      {/* Título de la página */}
      <h1>{namePage}</h1>
      {/* Descripción que aparece debajo del título */}
      <p className="description-head">{description}</p>
    </header>
  );
}
