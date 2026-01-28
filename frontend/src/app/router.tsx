import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetails from "../pages/ProductDetails";
import CartPage from "../pages/CartPage";
import SearchPage from "../pages/SearchPage";
import UserProfile from "../pages/Userprofile";
import AuthGuard from "../features/auth/AuthGuard";

/**
 * Router Yapısı
 * 
 * PUBLIC ROUTES (Herkes erişebilir):
 * - / (Ana sayfa)
 * - /login (Giriş)
 * - /search (Arama)
 * - /products/:categoryId (Ürünler)
 * - /product/:productId (Ürün detayı)
 * - /cart (Sepet - opsiyonel)
 * 
 * PROTECTED ROUTES (Sadece giriş yapmış kullanıcılar):
 * - /profile (Kullanıcı profili) 🔒
 * - /checkout (Ödeme) 🔒
 */

export const router = createBrowserRouter([
  // ===== PUBLIC ROUTES =====
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Ana sayfa
  {
    path: "/",
    element: <DashboardPage />,
  },

  // Arama
  {
    path: "/search",
    element: <SearchPage />,
  },

  // Kategori bazlı ürünler
  {
    path: "/products/:categoryId",
    element: <ProductsPage />,
  },

  // Ürün detayı
  {
    path: "/product/:productId",
    element: <ProductDetails />,
  },

  // Sepet (opsiyonel - drawer olarak da kullanılıyor)
  {
    path: "/cart",
    element: <CartPage />,
  },

  // ===== PROTECTED ROUTES (AuthGuard ile korunuyor) =====

  // Kullanıcı profili 🔒
  {
    path: "/profile",
    element: (
      <AuthGuard>
        <UserProfile />
      </AuthGuard>
    ),
  },

  // Ödeme (CheckoutPage hazır olduğunda)
  // {
  //   path: "/checkout",
  //   element: (
  //     <AuthGuard>
  //       <CheckoutPage />
  //     </AuthGuard>
  //   ),
  // },

  // Sipariş detayı (future)
  // {
  //   path: "/order/:orderId",
  //   element: (
  //     <AuthGuard>
  //       <OrderDetails />
  //     </AuthGuard>
  //   ),
  // },

  // Favorilerim (future)
  // {
  //   path: "/favorites",
  //   element: (
  //     <AuthGuard>
  //       <FavoritesPage />
  //     </AuthGuard>
  //   ),
  // },
]);