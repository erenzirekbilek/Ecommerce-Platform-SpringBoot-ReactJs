import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/auth.slice';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { LogOut, Settings, History, Heart, MapPin, Phone} from 'lucide-react';

/**
 * UserProfile Component
 * 
 * Sadece giriş yapmış kullanıcılar bu sayfayı görebilir.
 * Profil bilgilerini, siparişlerini ve ayarlarını yönetebilir.
 * 
 * Protected route ile AuthGuard tarafından korunur.
 */

interface UserData {
  id: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  createdAt: string;
}

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  itemCount: number;
}

interface Favorite {
  id: number;
  productName: string;
  price: number;
  image: string;
}

export default function UserProfile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  // Mock user data - backend'den gelecek
  const [userData] = useState<UserData>({
    id: 1,
    username: 'testuser',
    email: 'test@test.com',
    phone: '+90 212 123 45 67',
    address: 'İstanbul, Türkiye',
    profileImage: '👤',
    createdAt: '2024-01-15',
  });

  // Mock orders - backend'den gelecek
  const [orders] = useState<Order[]>([
    {
      id: 1,
      orderNumber: 'ORD-001234',
      date: '2024-01-20',
      total: 5999,
      status: 'delivered',
      itemCount: 2,
    },
    {
      id: 2,
      orderNumber: 'ORD-001235',
      date: '2024-01-18',
      total: 19000,
      status: 'shipped',
      itemCount: 1,
    },
    {
      id: 3,
      orderNumber: 'ORD-001236',
      date: '2024-01-10',
      total: 7500,
      status: 'pending',
      itemCount: 3,
    },
  ]);

  // Mock favorites - backend'den gelecek
  const [favorites] = useState<Favorite[]>([
    {
      id: 1,
      productName: 'ALFA 3250 AIO',
      price: 19000,
      image: '🖥️',
    },
    {
      id: 2,
      productName: 'ALFA 620C NOTEBOOK PC',
      price: 7500,
      image: '💻',
    },
  ]);

  // Logout işlemi
  const handleLogout = async () => {
    const confirmed = window.confirm('Çıkış yapmak istediğinize emin misiniz?');
    if (confirmed) {
      await dispatch(logout());
      navigate('/', { replace: true });
    }
  };

  // Status badge'i
  const getStatusBadge = (status: Order['status']) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Bekleniyor' },
      shipped: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Kargoda' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Teslim Edildi' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'İptal Edildi' },
    };
    return statusMap[status];
  };

  if (!isAuthenticated) {
    return null; // AuthGuard tarafından korunuyor, buraya gelmemeli
  }

  return (
    <DashboardLayout>
      <section className="bg-gray-50 min-h-screen py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
            <p className="text-gray-600 mt-1">Hesap bilgilerini yönet ve siparişlerini takip et</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* SIDEBAR - Profil Kartı */}
            <div className="lg:col-span-1">
              {/* Profil Kartı */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 sticky top-32">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg">
                    {userData.profileImage}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{userData.username}</h2>
                  <p className="text-gray-600 text-sm mt-1">{userData.email}</p>
                  <p className="text-gray-500 text-xs mt-1">Üye olunma: {new Date(userData.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>

                {/* Profil Bilgileri */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-3 text-sm">
                    <Phone size={16} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Telefon</p>
                      <p className="font-medium text-gray-900">{userData.phone || 'Belirtilmedi'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={16} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Adres</p>
                      <p className="font-medium text-gray-900">{userData.address || 'Belirtilmedi'}</p>
                    </div>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition">
                    <Settings size={18} />
                    Ayarları Düzenle
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-lg transition border border-red-200"
                  >
                    <LogOut size={18} />
                    Çıkış Yap
                  </button>
                </div>
              </div>

              {/* Favorilerim */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={20} className="text-red-500" />
                  <h3 className="text-lg font-bold text-gray-900">Favorilerim</h3>
                </div>

                {favorites.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">Henüz favori ürün yok</p>
                ) : (
                  <div className="space-y-3">
                    {favorites.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                        <div className="text-2xl">{item.image}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{item.productName}</p>
                          <p className="text-cyan-500 font-bold text-sm">₺{item.price.toLocaleString('tr-TR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MAIN - Siparişler */}
            <div className="lg:col-span-2">
              {/* Siparişlerim */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <History size={20} className="text-cyan-500" />
                    <h3 className="text-lg font-bold text-gray-900">Siparişlerim</h3>
                  </div>
                  <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
                    {orders.length} Sipariş
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <History size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz sipariş verilmemiş</p>
                    <button className="mt-4 text-cyan-500 hover:text-cyan-600 font-medium">
                      Alışverişe Başla
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusInfo = getStatusBadge(order.status);
                      return (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                              <p className="text-gray-600 text-sm">
                                {new Date(order.date).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <span className={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 rounded-full text-sm font-medium`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <p className="text-gray-600">{order.itemCount} ürün</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-600">Toplam</p>
                              <p className="text-xl font-bold text-cyan-500">₺{order.total.toLocaleString('tr-TR')}</p>
                            </div>
                          </div>

                          <button className="mt-4 w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition">
                            Detayları Gör
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* İstatistikler */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <p className="text-gray-600 text-sm">Toplam Sipariş</p>
                  <p className="text-3xl font-bold text-cyan-500 mt-2">{orders.length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <p className="text-gray-600 text-sm">Toplam Harcama</p>
                  <p className="text-3xl font-bold text-cyan-500 mt-2">
                    ₺{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}