"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../home/home-page.css";

export function HomePage() {
  // Estado para controlar el índice actual del carrusel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const processRef = useRef(null);

  // Configurar animaciones al hacer scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    const sections = [heroRef.current, missionRef.current, processRef.current];
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    // Observar todos los elementos con la clase .animate-on-scroll
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Datos del carrusel
  const carouselSlides = [
    {
      image:
        "https://cdn.pixabay.com/photo/2016/05/26/16/27/cinnamon-rolls-1417494_1280.jpg",
      title: "Rollos de Canela",
      subtitle:
        "Elaborado con técnicas tradicionales y los mejores ingredientes",
      buttonText: "Ver Productos",
      buttonLink: "/catalogo",
    },
    {
      image:
        "https://cdn.pixabay.com/photo/2019/09/29/19/20/sweet-4514136_1280.jpg",
      title: "Croissant Clásico",
      subtitle: "Descubre el verdadero sabor del pan hecho con pasión",
      buttonText: "Conocer Más",
      buttonLink: "/catalogo",
    },
    {
      image: "/images/pandemasamadre.png",
      title: "Pan de Masa Madre",
      subtitle: "La fermentación natural que da carácter a nuestro pan",
      buttonText: "Explorar",
      buttonLink: "/catalogo",
    },
  ];

  // Pasos del proceso
  const processSteps = [
    {
      icon: "🌾",
      title: "Selección de ingredientes",
      description:
        "Escogemos los mejores ingredientes orgánicos y locales para nuestros productos.",
    },
    {
      icon: "🧪",
      title: "Fermentación lenta",
      description:
        "Dejamos que la masa fermente naturalmente durante 24-48 horas para desarrollar sabores complejos.",
    },
    {
      icon: "🔥",
      title: "Horneado tradicional",
      description:
        "Horneamos en hornos de piedra para lograr la corteza perfecta y una miga excepcional.",
    },
    {
      icon: "🥖",
      title: "Frescura diaria",
      description:
        "Cada día horneamos productos frescos para garantizar la mejor calidad.",
    },
  ];

  // Navegar a la imagen anterior
  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselSlides.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Navegar a la siguiente imagen
  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselSlides.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Efecto parallax al hacer scroll
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Parallax para secciones con fondo
    document.querySelectorAll(".parallax-bg").forEach((section) => {
      const speed = 0.5;
      const yPos = -(scrollPosition * speed);
      section.style.backgroundPosition = `center ${yPos}px`;
    });

    // Efecto de rotación para los iconos
    document.querySelectorAll(".card-icon-container").forEach((icon) => {
      const rect = icon.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const centerX = rect.left + rect.width / 2;
      const windowCenterY = window.innerHeight / 2;
      const windowCenterX = window.innerWidth / 2;

      // Calcular la rotación basada en la posición relativa al centro de la ventana
      const rotateX = (windowCenterY - centerY) / 50;
      const rotateY = (centerX - windowCenterX) / 50;

      // Aplicar la transformación solo si el elemento está visible
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        icon.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    });
  }, [scrollPosition]);

  return (
    <div className="home-container">
      {/* Hero Section con Carrusel */}
      <section className="hero-section" ref={heroRef}>
        <div className="carousel-container">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {carouselSlides.map((slide, index) => (
              <div className="carousel-slide" key={index}>
                <div className="slide-image-container">
                  <img
                    src={slide.image || "/placeholder.svg"}
                    alt={slide.title}
                    className="slide-image"
                  />
                  <div className="slide-overlay"></div>
                </div>
                <div className="slide-content">
                  <h1 className="slide-title">{slide.title}</h1>
                  <p className="slide-subtitle">{slide.subtitle}</p>
                  <Link to={slide.buttonLink} className="slide-button">
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button
            className="carousel-control prev"
            onClick={handlePrev}
            aria-label="Anterior"
          >
            <span className="control-icon">&#10094;</span>
          </button>
          <button
            className="carousel-control next"
            onClick={handleNext}
            aria-label="Siguiente"
          >
            <span className="control-icon">&#10095;</span>
          </button>

          <div className="carousel-indicators">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => {
                  setIsAnimating(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }}
                aria-label={`Ir a diapositiva ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Bienvenida */}
      <section className="welcome-section">
        <div className="welcome-content animate-on-scroll fade-up">
          <h2 className="section-title">Bienvenidos a Love Bites</h2>
          <div className="title-decoration">
            <span className="decoration-line"></span>
            <span className="decoration-icon">🌾</span>
            <span className="decoration-line"></span>
          </div>
          <p className="welcome-text">
            Somos una panadería artesanal dedicada a crear productos de la más
            alta calidad. Nuestro compromiso es ofrecer pan y repostería
            elaborados con ingredientes naturales, técnicas tradicionales y
            mucho amor por nuestro oficio.
          </p>
          <div className="welcome-features">
            <div className="feature animate-on-scroll fade-up">
              <div className="feature-icon">🌿</div>
              <h3>Ingredientes Naturales</h3>
              <p>Sin aditivos ni conservantes artificiales</p>
            </div>
            <div
              className="feature animate-on-scroll fade-left"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="feature-icon">⏱️</div>
              <h3>Fermentación Lenta</h3>
              <p>Más sabor y mejor digestión</p>
            </div>
            <div
              className="feature animate-on-scroll fade-right"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="feature-icon">🔥</div>
              <h3>Horneado Tradicional</h3>
              <p>En hornos de piedra para una corteza perfecta</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Misión y Visión Mejorada */}
      <section className="mission-vision-section" ref={missionRef}>
        <div className="mission-vision-background"></div>
        <div className="mission-vision-content">
          <div className="mission-vision-header animate-on-scroll scale-in">
            <h2 className="mv-main-title">Nuestra Esencia</h2>
            <div className="title-decoration">
              <span className="decoration-line"></span>
              <span className="decoration-icon">✦</span>
              <span className="decoration-line"></span>
            </div>
            <p className="mv-subtitle">
              Descubre los valores que nos definen y guían nuestro camino
            </p>
          </div>

          <div className="mission-vision-cards">
            <div className="mission-card animate-on-scroll fade-left">
              <div className="card-header">
                <div className="card-icon-container">
                  <div className="card-icon">🎯</div>
                </div>
                <h2 className="card-title">Misión</h2>
              </div>
              <div className="card-content">
                <p className="card-text">
                  Elaborar panes de masa madre auténticos y nutritivos,
                  utilizando técnicas tradicionales y los mejores ingredientes
                  naturales. Nuestro propósito es brindar a nuestros clientes
                  una experiencia única de calidad y sabor, a través de un
                  modelo exclusivo de ventas en línea y a puerta cerrada, que
                  garantice frescura en cada pedido y fomente prácticas
                  sostenibles en cada etapa de nuestro proceso.
                </p>
              </div>
              <div className="card-decoration">
                <div className="card-decoration-circle"></div>
                <div className="card-decoration-line"></div>
              </div>
            </div>

            <div className="vision-card animate-on-scroll fade-right">
              <div className="card-header">
                <div className="card-icon-container">
                  <div className="card-icon">🔭</div>
                </div>
                <h2 className="card-title">Visión</h2>
              </div>
              <div className="card-content">
                <p className="card-text">
                  Convertirnos en la panadería en línea líder en productos de
                  masa madre, reconocida por ofrecer panes artesanales de alta
                  calidad, elaborados con ingredientes naturales, y entregados
                  directamente a los hogares de nuestros clientes, preservando
                  la autenticidad, el sabor y el compromiso con la
                  sostenibilidad. Buscamos ser el referente en panadería
                  digital, destacándonos por la innovación, la atención
                  personalizada y una experiencia de compra única, que combine
                  tradición y tecnología.
                </p>
              </div>
              <div className="card-decoration">
                <div className="card-decoration-circle"></div>
                <div className="card-decoration-line"></div>
              </div>
            </div>
          </div>

          <div className="mission-vision-values animate-on-scroll fade-up">
            <div
              className="value-item animate-on-scroll scale-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="value-icon">🌱</div>
              <h3 className="value-title">Sostenibilidad</h3>
            </div>
            <div
              className="value-item animate-on-scroll scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="value-icon">💯</div>
              <h3 className="value-title">Calidad</h3>
            </div>
            <div
              className="value-item animate-on-scroll scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="value-icon">🤝</div>
              <h3 className="value-title">Compromiso</h3>
            </div>
            <div
              className="value-item animate-on-scroll scale-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="value-icon">🔄</div>
              <h3 className="value-title">Innovación</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Proceso */}
      <section className="process-section" ref={processRef}>
        <div className="process-content scroll-reveal">
          <h2 className="section-title">Nuestro Proceso</h2>
          <div className="title-decoration">
            <span className="decoration-line"></span>
            <span className="decoration-icon">🍞</span>
            <span className="decoration-line"></span>
          </div>
          <div className="process-steps">
            {processSteps.map((step, index) => (
              <div
                className={`process-step animate-on-scroll ${
                  index % 2 === 0 ? "fade-left" : "fade-right"
                }`}
                key={index}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Llamada a la Acción */}
      <section className="cta-section parallax-bg">
        <div className="cta-content animate-on-scroll scale-in">
          <h2 className="cta-title">¿Listo para probar nuestros productos?</h2>
          <p className="cta-text">
            Visita nuestro catálogo y descubre toda nuestra variedad de panes
            artesanales y dulces.
          </p>
          <Link to="/catalogo" className="cta-button">
            Explorar Catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
