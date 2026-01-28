import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Refresh token cookie'leri için kalmalı
});

// İSTEK KESİCİ (Interceptor) - Token'ı buraya ekliyoruz
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      // Backend'in beklediği Bearer formatı
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// HATA KESİCİ - 401 durumunda otomatik işlem yapmak istersen
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Yetki hatası: Giriş yapmanız gerekiyor veya token süresi dolmuş.");
      // Burada istersen kullanıcıyı login'e yönlendirebilirsin
    }
    return Promise.reject(error);
  }
);