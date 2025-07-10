"use client";

import React from "react";
import { Fragment } from "react";
import { Header } from "../components/common/header/Header.jsx";
import { Footer } from "../components/common/footer/Footer";
import { HomePage } from "../pages/home/HomePage.jsx";
import { CatalogPage } from "../pages/catalog/CatalogPage";
import { LoginRoutePage } from "./LoginRoutePage.jsx";
import { RegisterRouterPage } from "./RegisterRouterPage.jsx";
import { ForgotPasswordPage } from "../pages/auth/forgot/ForgotPasswordPage.jsx";
import { ResetPasswordPage } from "../pages/auth/reset/ResetPasswordPage.jsx";
import { SlideCart } from "../pages/cart/SlideCart";
import {
  defaultIcons,
  getHeaderItems,
  getMenuItems,
} from "../../src/models/MenuConfig";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ProtectedRoute } from "../routes/ProtectedRoute.jsx";
import { AdminDashboard } from "../pages/admin/AdminDashboard";

//Importaciones de los modulos de Admin
import InventoryManagement from "../pages/admin/inventory/InventoryManagement.jsx";
import { AdminOrders } from "../pages/admin/orders/OrderManagement.jsx";
import { AdminProductions } from "../pages/admin/production/ProductionManagement.jsx";
import { AdminProducts } from "../pages/admin/products/ProductManagement.jsx";
import { AdminUsers } from "../pages/admin/users/UserManagement.jsx";

//importaciones de los crud de recetas y productos
import { Recetasform } from "../pages/admin/receta/crud_rece.jsx";
import Profile from "../pages/userProfile/userProfile.jsx";
import VerifyEmail from "../pages/userProfile/verifyEmail.jsx";

// Componente de layout para las páginas
import { useAuth } from "../context/AuthContext";
const PageLayout = ({ children, config }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Detecta el tipo de menú dinámicamente según el rol
  let menuType = "catalog";
  if (isAdmin) menuType = "admin";
  if (config && config.menuType) menuType = config.menuType;

  const itemHeader = getHeaderItems(menuType);
  const itemMenu = getMenuItems(menuType);
  const { iconMenu, icon1, icon2, link2, link } = config;
  const footerRef = React.useRef(null);

  // Rutas donde NO se debe mostrar el header
  const hideHeaderRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const hideHeader = hideHeaderRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <Fragment>
      {!hideHeader && (
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
      )}
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
        path="/forgot-password"
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
        path="/reset-password"
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
            <ResetPasswordPage />
          </PageLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <PageLayout
              config={{
                menuType: "admin",
                iconMenu: defaultIcons.iconMenu,
                icon1: defaultIcons.icon1,
                link: "/",
              }}
            >
              <AdminDashboard />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* ruta para la gestion de usuarios */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin={true}>
            <PageLayout
              config={{
                menuType: "admin",
                iconMenu: defaultIcons.iconMenu,
                icon1: defaultIcons.icon1,
                link: "/",
              }}
            >
              <AdminUsers />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      {/* ruta para la gestion de productos y recetas */}
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute requireAdmin={true}>
            <PageLayout
              config={{
                itemHeader: getHeaderItems("admin"),
                itemMenu: getMenuItems("admin"),
                iconMenu: defaultIcons.iconMenu,
                icon1: defaultIcons.icon1,
                link: "/",
              }}
            >
              <AdminProducts />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      {/* ruta para la gestion de pedidos*/}
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute requireAdmin={true}>
            <PageLayout
              config={{
                itemHeader: getHeaderItems("admin"),
                itemMenu: getMenuItems("admin"),
                iconMenu: defaultIcons.iconMenu,
                icon1: defaultIcons.icon1,
                link: "/",
              }}
            >
              <AdminOrders />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      {/* ruta para la gestion del inventario o existencias*/}
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute requireAdmin={true}>
            <PageLayout
              config={{
                itemHeader: getHeaderItems("admin"),
                itemMenu: getMenuItems("admin"),
                iconMenu: defaultIcons.iconMenu,
                icon1: defaultIcons.icon1,
                link: "/",
              }}
            >
              <InventoryManagement />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      {/* ruta para produccion del admin*/}
      <Route
        path="/admin/productions"
        element={
          <ProtectedRoute requireAdmin={true}>
            <PageLayout
              config={{
                itemHeader: getHeaderItems("admin"),
                itemMenu: getMenuItems("admin"),
                iconMenu: defaultIcons.iconMenu,
                icon1: defaultIcons.icon1,
                link: "/",
              }}
            >
              <AdminProductions />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      {/* ruta para el crud de recetas */}
      <Route
        path="/crud_rece/:id"
        element={
          <ProtectedRoute requireAdmin={true}>
            <PageLayout
              config={{
                itemHeader: getHeaderItems("admin"),
                itemMenu: getMenuItems("admin"),
                iconMenu: defaultIcons.iconMenu,
                icon1: defaultIcons.icon1,
                link: "/",
              }}
            >
              <Recetasform />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
           <ProtectedRoute>
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
              <Profile />
            </PageLayout>
           </ProtectedRoute>
        }
      />
      <Route
        path="/verify-email"
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
            <VerifyEmail />
          </PageLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
