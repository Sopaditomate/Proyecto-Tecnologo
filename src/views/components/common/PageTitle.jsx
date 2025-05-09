// Componente para títulos de página con subtítulo
import "../../../styles/catalog/product-title.css"

export function PageTitle({ title, subtitle }) {
  return (
    <div>
      <h1 className="products-title">{title}</h1>
      <p className="products-subtitle">{subtitle}</p>
    </div>
  )
}
