import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetails from "../pages/ProductDetails";
import CartPage from "../pages/CartPage";
import SearchPage from "../pages/SearchPage";
import UserProfile from "../pages/Userprofile";
import CheckoutPage from "../pages/CheckoutPage";
import OrderConfirmationPage from "../pages/OrderConfirmationPage";
import OrdersPage from "../pages/OrderPage";
import AuthGuard from "../features/auth/AuthGuard";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <DashboardPage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/products/:categoryId",
    element: <ProductsPage />,
  },
  {
    path: "/product/:productId",
    element: <ProductDetails />,
  },
  {
    path: "/cart",
    element: <CartPage />,
  },
  {
    path: "/checkout",
    element: (
      <AuthGuard>
        <CheckoutPage />
      </AuthGuard>
    ),
  },
  {
    path: "/order-confirmation/:orderId",
    element: (
      <AuthGuard>
        <OrderConfirmationPage />
      </AuthGuard>
    ),
  },
  {
    path: "/orders",
    element: (
      <AuthGuard>
        <OrdersPage />
      </AuthGuard>
    ),
  },
  {
    path: "/profile",
    element: (
      <AuthGuard>
        <UserProfile />
      </AuthGuard>
    ),
  },
]);