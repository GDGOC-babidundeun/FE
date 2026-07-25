import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./index.css";
import { AdminDataProvider } from "./store/AdminDataContext";
import RequireAdminAuth from "./components/RequireAdminAuth";
import LoginPage from "./pages/owner/LoginPage";
import OrdersDashboardPage from "./pages/owner/OrdersDashboardPage";
import MenuManagementPage from "./pages/owner/MenuManagementPage";
import PaymentHistoryPage from "./pages/owner/PaymentHistoryPage";
import SettingsPage from "./pages/owner/SettingsPage";

// 학생용 컴포넌트 임포트
import { UserDataProvider } from "./store/UserDataContext";
import UserShell from "./components/user/UserShell";
import MenuPage from "./pages/user/MenuPage";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import OrderStatusPage from "./pages/user/OrderStatusPage";
import OrderCompletePage from "./pages/user/OrderCompletePage";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  // 회원가입은 추후 개발 예정 — 지금은 로그인 화면으로 되돌립니다
  { path: "/signup", element: <Navigate to="/login" replace /> },
  { path: "/admin", element: <Navigate to="/admin/orders" replace /> },
  {
    path: "/admin/orders",
    element: (
      <RequireAdminAuth>
        <OrdersDashboardPage />
      </RequireAdminAuth>
    ),
  },
  {
    path: "/admin/menus",
    element: (
      <RequireAdminAuth>
        <MenuManagementPage />
      </RequireAdminAuth>
    ),
  },
  {
    path: "/admin/payments",
    element: (
      <RequireAdminAuth>
        <PaymentHistoryPage />
      </RequireAdminAuth>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <RequireAdminAuth>
        <SettingsPage />
      </RequireAdminAuth>
    ),
  },
  {
    path: "/user",
    element: (
      <UserDataProvider>
        <UserShell />
      </UserDataProvider>
    ),
    children: [
      { index: true, element: <MenuPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders/:orderId", element: <OrderStatusPage /> },
      { path: "orders/:orderId/complete", element: <OrderCompletePage /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminDataProvider>
      <RouterProvider router={router} />
    </AdminDataProvider>
  </StrictMode>,
);

