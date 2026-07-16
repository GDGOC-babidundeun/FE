import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./index.css";
import { AdminDataProvider } from "./store/AdminDataContext";
import LoginPage from "./pages/owner/LoginPage";
import SignupPage from "./pages/owner/SignupPage";
import OrdersDashboardPage from "./pages/owner/OrdersDashboardPage";
import MenuManagementPage from "./pages/owner/MenuManagementPage";
import PaymentHistoryPage from "./pages/owner/PaymentHistoryPage";
import SettingsPage from "./pages/owner/SettingsPage";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/admin", element: <Navigate to="/admin/orders" replace /> },
  { path: "/admin/orders", element: <OrdersDashboardPage /> },
  { path: "/admin/menus", element: <MenuManagementPage /> },
  { path: "/admin/payments", element: <PaymentHistoryPage /> },
  { path: "/admin/settings", element: <SettingsPage /> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminDataProvider>
      <RouterProvider router={router} />
    </AdminDataProvider>
  </StrictMode>,
);
