import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { SidebarProvider } from "./components/ui/sidebar";
import ProtAuth from "./Auth/ProtAuth";
import LoginAdmin from "./Pages/Autherzation/LoginAdmin";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./Auth/ProtectedRoute";
import AuthLayout from "./Layout/AuthLayout";
import Home from "./Pages/Admin/Home/Home";
import Stock from "./Pages/Admin/Stock/Stock";
import AddStock from "./Pages/Admin/Stock/AddStock";
import StockMan from "./Pages/Admin/StockMan/StockMan";
import AddStockMan from "./Pages/Admin/StockMan/AddStockMan";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <ProtAuth>
            <LoginAdmin />
          </ProtAuth>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AdminLayout />
        </SidebarProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "stock",
        children: [
          { index: true, element: <Stock /> },
          { path: "add", element: <AddStock /> },
          { path: "edit/:stockId", element: <AddStock /> },
        ],
      },
      {
        path: "stock_man",
        children: [
          { index: true, element: <StockMan /> },
          { path: "add", element: <AddStockMan /> },
          { path: "edit/:stockManId", element: <AddStockMan /> },
        ],
      },

      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;