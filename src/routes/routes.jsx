"use client";
// Configuración de rutas de la aplicación
import React from "react";
import { Fragment } from "react";
import { Header } from "../views/components/common/header/Header";
import { Footer } from "../views/components/common/footer/Footer";
import { HomePage } from "../views/pages/home/HomePage";
import { CatalogPage } from "../views/pages/catalog/CatalogPage";
import { ShoppingCartPage } from "../views/pages/cart/ShoppingCartPage";
import { LoginPage } from "../views/pages/auth/login/LoginPage";
import { RegisterPage } from "../views/pages/auth/register/RegisterPage";
import { ForgotPasswordPage } from "../views/pages/auth/login/ForgotPasswordPage";
import {
  defaultIcons,
  getHeaderItems,
  getMenuItems,
} from "../models/MenuConfig";


// Componente de layout para las páginas
const PageLayout = ({ children, config }) => {
  const {
    itemHeader = [],
    itemMenu = [],
    iconMenu,
    icon1,
    icon2,
    link2,
    link,
  } = config;
  const footerRef = React.useRef(null);

  return (
    <Fragment>
      <Header
        itemHeader={itemHeader}
        itemMenu={itemMenu}
        iconMenu={iconMenu}
        icon1={icon1}
        icon2={icon2}
        link2={link2}
        link={link}
        footerRef={footerRef}
      />
      {children}
      <Footer ref={footerRef} />
    </Fragment>
  );
};

// Definición de todas las rutas de la aplicación
export const AppRoutes = [
  {
    path: "/",
    element: (
      <PageLayout
        config={{
          itemHeader: getHeaderItems("home"),
          itemMenu: getMenuItems(),
          iconMenu: defaultIcons.iconMenu,
          icon1: defaultIcons.icon1,
          icon2: "/assets/login.svg",
          link2: "/login",
        }}
      >
        <HomePage />
      </PageLayout>
    ),
  },
  {
    path: "/catalogo",
    element: (
      <PageLayout
        config={{
          itemHeader: getHeaderItems("catalog"),
          itemMenu: getMenuItems("catalog"),
          iconMenu: defaultIcons.iconMenu,
          icon1: defaultIcons.icon1,
          icon2: defaultIcons.icon2,
          link2: defaultIcons.link2,
        }}
      >
        <CatalogPage />
      </PageLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <PageLayout
        config={{
          itemHeader: getHeaderItems("login"),
          itemMenu: getMenuItems("login"),
          iconMenu: defaultIcons.iconMenu,
          icon1: defaultIcons.icon1,
          link: "/",
        }}
      >
        <LoginPage />
      </PageLayout>
    ),
  },
  {
    path: "/createAccount",
    element: (
      <PageLayout
        config={{
          itemHeader: getHeaderItems("login"),
          itemMenu: getMenuItems("login"),
          iconMenu: defaultIcons.iconMenu,
          icon1: defaultIcons.icon1,
          link: "/login",
        }}
      >
        <RegisterPage />
      </PageLayout>
    ),
  },
  {
    path: "/forgotYourPassword",
    element: (
      <PageLayout
        config={{
          itemHeader: getHeaderItems("login"),
          itemMenu: getMenuItems("login"),
          iconMenu: defaultIcons.iconMenu,
          icon1: defaultIcons.icon1,
          link: "/login",
        }}
      >
        <ForgotPasswordPage />
      </PageLayout>
    ),
  },
  {
    path: "/shoppingCart",
    element: (
      <PageLayout
        config={{
          itemHeader: [
            { name: "Carrito de Compras" },
            { name: "Catalogo", path: "/catalogo" },
          ],
          itemMenu: [
            {
              name: "Ver Catalogo",
              path: "/catalogo",
              icon: "/assets/baguette-catalog.svg",
            },
            { name: "Inicio", icon: "/assets/house.svg", path: "/" },
            { name: "Contacto", icon: "/assets/contact.svg" },
          ],
          iconMenu: defaultIcons.iconMenu,
          icon1: defaultIcons.icon1,
          link: "/catalogo",
        }}
      >
        <ShoppingCartPage />
      </PageLayout>
    ),
  },
];
