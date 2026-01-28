import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { LogOut, User, ShoppingBag, Settings, Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectAuthUser } from '../../features/auth/auth.slice';
import { useCart } from '../../hooks/useCart'; // ✅ Import

export default function UserProfileDropdown() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const { cart} = useCart(); // ✅ Sepeti çek

  // Test
  useEffect(() => {
    console.log('GİRİŞ YAPAN USER:', user);
    console.log('EMAIL:', user?.email);
    console.log('USERNAME:', user?.username);
    console.log('USER ID:', user?.id);
    console.log('SEPET:', cart);
  }, [user, cart]);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    setIsOpen(false);
    navigate('/', { replace: true });
  };

  const menuItems = [
    {
      icon: User,
      label: 'Profilim',
      onClick: () => {
        navigate('/profile');
        setIsOpen(false);
      },
    },
    {
      icon: ShoppingBag,
      label: `Siparişlerim ${cart?.totalQuantity ? `(${cart.totalQuantity})` : ''}`,
      onClick: () => {
        navigate('/orders');
        setIsOpen(false);
      },
    },
    {
      icon: Heart,
      label: 'Favorilerim',
      onClick: () => {
        navigate('/favorites');
        setIsOpen(false);
      },
    },
    {
      icon: Settings,
      label: 'Ayarlar',
      onClick: () => {
        navigate('/settings');
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-all duration-200 active:scale-90 group"
      >
        {cart && cart.totalQuantity > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {cart.totalQuantity}
          </span>
        )}
        <svg
          className="w-4 h-4 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0012 15a7.488 7.488 0 00-5.982 3.725M9 9a3 3 0 106 0 3 3 0 00-6 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">
              {user?.username || 'Kullanıcı'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
            {cart && (
              <p className="text-xs text-cyan-600 font-medium mt-1">
                Sepet: ₺{cart.totalPrice.toFixed(2)}
              </p>
            )}
          </div>

          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-cyan-600 flex items-center gap-3 transition-colors"
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-200 py-1">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-semibold"
            >
              <LogOut size={16} />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}