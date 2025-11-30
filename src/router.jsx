import { createBrowserRouter } from "react-router-dom";
import BranchLayout from "./Layout/BranchLayout";
import { SidebarProvider } from "./components/ui/sidebar";
import ProtAuth from "./Auth/ProtAuth";
import LoginBranch from "./Pages/Autherzation/LoginBranch";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./Auth/ProtectedRoute";
import AuthLayout from "./Layout/AuthLayout";
import Home from "./Pages/Branch/Home/Home";
import Stock from "./Pages/Branch/Stocks/StockList/StockList";
import AddStock from "./Pages/Branch/Stocks/StockList/AddStockList";
import StockMan from "./Pages/Branch/Stocks/StockMan/StockMan";
import AddStockMan from "./Pages/Branch/Stocks/StockMan/AddStockMan";
import StockProduct from "./Pages/Branch/Stocks/StockProduct/StockProduct";
import AddStockProduct from "./Pages/Branch/Stocks/StockProduct/AddStockProduct";
import StockCategory from "./Pages/Branch/Stocks/StockCategory/StockCategory";
import AddStockCategory from "./Pages/Branch/Stocks/StockCategory/AddStockCategory";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <ProtAuth>
            <LoginBranch />
          </ProtAuth>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <BranchLayout />
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
          {
            path: "list",
            children: [
              { index: true, element: <Stock /> },
              { path: "add", element: <AddStock /> },
              { path: "edit/:stockId", element: <AddStock /> },
            ],
          },
          {
            path: "man",
            children: [
              { index: true, element: <StockMan /> },
              { path: "add", element: <AddStockMan /> },
              { path: "edit/:stockManId", element: <AddStockMan /> },
            ],
          },
          {
            path: "category",
            children: [
              { index: true, element: <StockCategory /> },
              { path: "add", element: <AddStockCategory /> },
              { path: "edit/:categoryId", element: <AddStockCategory /> },
            ],
          },
          {
            path: "product",
            children: [
              { index: true, element: <StockProduct /> },
              { path: "add", element: <AddStockProduct /> },
              { path: "edit/:productId", element: <AddStockProduct /> },
            ],
          },
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