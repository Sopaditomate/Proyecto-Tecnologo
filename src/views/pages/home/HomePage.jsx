"use client";

// Página de inicio con carrusel de imágenes
import { useState } from "react";
import { PageTitle } from "../../components/common/PageTitle";
import { carouselImages } from "../../../models/CarouselData";
import "../../../styles/inicio/inicio.css";
import "../../../styles/catalog/catalog.css";

export function HomePage() {
  // Estado para controlar el índice actual del carrusel
  const [currentIndex, setCurrentIndex] = useState(0);

  // Navegar a la imagen anterior
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  // Navegar a la siguiente imagen
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel-container">
      <main className="main-content">
        <div className="carousel-wrapper">
          <div className="welcome">
            <PageTitle
              title="Bienvenidos a Love Bites"
              subtitle="Panadería artesanal con los mejores sabores tradicionales. Nuestros productos son elaborados diariamente con ingredientes de primera calidad y técnicas ancestrales."
            />
          </div>

          {/* Carrusel de imágenes */}
          <div className="image-grid">
            <div className="main-image-container">
              <img
                src={
                  carouselImages[currentIndex].mainImage.src ||
                  "/placeholder.svg"
                }
                alt={carouselImages[currentIndex].mainImage.alt}
                className="carousel-image"
              />
              <p className="image-caption">
                {carouselImages[currentIndex].mainImage.caption}
              </p>
            </div>
            <div className="side-image-container">
              <img
                src="/images/imginicio.jpg"
                alt="Panadero"
                className="carousel-image"
              />
              <p className="image-caption">
                {
                  "Nuestros maestros panaderos trabajan con pasión y dedicación para ofrecerte el mejor pan artesanal. Cada pieza es única y refleja nuestra tradición y compromiso con la calidad."
                }
              </p>
            </div>
          </div>

          {/* Controles de navegación */}
          <div className="navigation-controls">
            <button
              className="nav-button"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              &lt;
            </button>
            <div className="dots-container">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
            <button
              className="nav-button"
              onClick={handleNext}
              aria-label="Next image"
            >
              &gt;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
