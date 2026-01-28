import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login } from "./auth.slice";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const handleLogin = () => {
    dispatch(login({ email: "deneme123", password: "denemeXX" }));
  };

  // 🔹 Eğer login başarılı ise dashboard’a yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-blue-600 text-white rounded"
      >
        {loading ? "Loading..." : "Login"}
      </button>

      {isAuthenticated && accessToken && (
        <div className="text-green-600">
          Token: {accessToken.substring(0, 20)}...
        </div>
      )}
    </div>
  );
};

export default LoginPage;






    // dispatch(login({ username: "deneme123", password: "denemeXX" }));
