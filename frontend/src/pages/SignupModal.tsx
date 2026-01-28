import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { signup } from '../features/auth/auth.slice';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const isUsernameValid = username.length >= 3 && username.length <= 20;
  const isPasswordValid = password.length >= 6 && password.length <= 40;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 50;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!isUsernameValid || !isPasswordValid || !isEmailValid) {
      setMessage('Lütfen tüm alanları doğru şekilde doldurun');
      return;
    }

    try {
      const result = await dispatch(signup({ email, password })).unwrap();
      
      if (result.accessToken) {
        setMessage('Kayıt başarılı! Giriş yapılıyor...');
        setTimeout(() => {
          setUsername('');
          setEmail('');
          setPassword('');
          setMessage('');
          onClose();
        }, 1500);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Kayıt başarısız. Tekrar deneyin.';
      setMessage(errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 px-6 py-6 text-center border-b border-cyan-100 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-600" />
          </button>
          <div className="w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-xl">📝</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Hesap Oluştur</h2>
          <p className="text-gray-600 text-xs">Yeni bir hesap aç</p>
        </div>

        <form onSubmit={handleSignup} className="px-6 py-5 space-y-3">
          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${
              message.includes('başarılı') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg text-sm text-center bg-red-100 text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="kullaniciadi"
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:bg-gray-100"
            />
            {username && !isUsernameValid && (
              <p className="text-xs text-red-500 mt-1">3-20 karakter arası</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:bg-gray-100"
            />
            {email && !isEmailValid && (
              <p className="text-xs text-red-500 mt-1">Geçerli bir e-posta girin</p>
            )}
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
            {password && !isPasswordValid && (
              <p className="text-xs text-red-500 mt-1">Minimum 6 karakter</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isUsernameValid || !isEmailValid || !isPasswordValid}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition shadow-lg shadow-cyan-200 text-sm mt-4"
          >
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-600">
          Zaten hesabın var mı?{' '}
          <button onClick={onSwitchToLogin} disabled={loading} className="text-cyan-600 hover:text-cyan-700 font-medium transition disabled:opacity-50">
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}