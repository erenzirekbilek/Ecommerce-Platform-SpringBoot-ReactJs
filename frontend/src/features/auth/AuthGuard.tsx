import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
}

/**
 * AuthGuard Component
 * 
 * Sadece giriş yapmış kullanıcıların erişebileceği sayfaları korur.
 * Giriş yapılmamışsa /login sayfasına yönlendirir.
 * 
 * Kullanım:
 * <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
 */
const AuthGuard = ({ children }: Props) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    // Giriş yapılmamışsa login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }

  // Giriş yapılmışsa sayfayı göster
  return children;
};

export default AuthGuard;