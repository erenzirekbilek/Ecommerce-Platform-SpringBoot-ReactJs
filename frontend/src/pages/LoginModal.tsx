import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login } from '../features/auth/auth.slice';
import { jwtDecode } from 'jwt-decode';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

interface TokenPayload {
  sub: string;
  [key: string]: unknown;
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLocalError(null);

  try {
    const result = await dispatch(login({ email, password })).unwrap();
    const token = result.accessToken;

    localStorage.setItem('token', token);
    
    const decoded: TokenPayload = jwtDecode(token);
    
    // Token'dan email al, username olarak kaydet
    const userEmail = decoded.sub || email;
    localStorage.setItem('username', userEmail);
    localStorage.setItem('userEmail', userEmail);
    
    if (rememberMe) {
      localStorage.setItem("rememberMe", email);
    }

    setTimeout(() => {
      onClose();
    }, 500);
  } catch (err: unknown) {
    if (err instanceof Error) {
      setLocalError(err.message);
    } else {
      setLocalError('Beklenmedik bir hata oluştu');
    }
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 px-6 py-6 text-center border-b border-cyan-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full transition"
          >
            <X size={20} className="text-gray-600" />
          </button>

          <div className="w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-xl">🔐</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Hoş Geldiniz</h2>
          <p className="text-gray-600 text-xs">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleLogin} className="px-6 py-5 space-y-3">
          {localError && (
            <div className="p-3 rounded-lg text-sm text-center bg-red-100 text-red-800">
              {localError}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg text-sm text-center bg-red-100 text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:bg-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Şifre</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:bg-gray-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
              />
              <span className="text-gray-700">Beni hatırla</span>
            </label>
            <button type="button" className="text-cyan-600 hover:text-cyan-700 font-medium transition">
              Şifremi Unuttum
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition shadow-lg shadow-cyan-200 text-sm"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-600">veya</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={loading} className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition text-xs disabled:opacity-50">
              <span>G</span> <span>Google</span>
            </button>
            <button type="button" disabled={loading} className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition text-xs disabled:opacity-50">
              <span>⚫</span> <span>GitHub</span>
            </button>
          </div>
        </form>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-600">
          Hesabınız yok mu?{' '}
          <button onClick={onSwitchToSignup} disabled={loading} className="text-cyan-600 hover:text-cyan-700 font-medium transition disabled:opacity-50">
            Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  );
}