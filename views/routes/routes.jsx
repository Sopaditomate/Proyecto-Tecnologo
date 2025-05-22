import React from "react";
import { Fragment } from "react";
import { Header } from "../components/common/header/Header.jsx";
import { Footer } from "../components/common/footer/Footer";
import { HomePage } from "../pages/home/HomePage.jsx";
import { CatalogPage } from "../pages/catalog/CatalogPage";
import { LoginRoutePage } from "./LoginRoutePage.jsx";
import { RegisterRouterPage } from "./RegisterRouterPage.jsx";
import { ForgotPasswordPage } from "../pages/auth/login/ForgotPasswordPage";
import { SlideCart } from "../pages/cart/SlideCart";
import {
  defaultIcons,
  getHeaderItems,
  getMenuItems,
} from "../../src/models/MenuConfig";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../routes/ProtectedRoute.jsx";
import { AdminDashboard } from "../pages/admin/AdminDashboard";

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
      <SlideCart />
      <Footer ref={footerRef} />
    </Fragment>
  );
};

// Definición de todas las rutas de la aplicación
export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
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
        }
      />
      <Route
        path="/catalogo"
        element={
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
        }
      />
      <Route
        path="/login"
        element={
          <PageLayout
            config={{
              itemHeader: getHeaderItems("login"),
              itemMenu: getMenuItems("login"),
              iconMenu: defaultIcons.iconMenu,
              icon1: defaultIcons.icon1,
              link: "/",
            }}
          >
            <LoginRoutePage />
          </PageLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PageLayout
            config={{
              itemHeader: getHeaderItems("login"),
              itemMenu: getMenuItems("login"),
              iconMenu: defaultIcons.iconMenu,
              icon1: defaultIcons.icon1,
              link: "/login",
            }}
          >
            <RegisterRouterPage />
          </PageLayout>
        }
      />
      <Route
        path="/forgotYourPassword"
        element={
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
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
