import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useCart } from '../hooks/useCart';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    totals,
    loading,
    error,
    isEmpty,
    syncInProgress,
    increment,
    decrement,
    removeItem,
    clear,
    calculateShipping,
    calculateTotal,
  } = useCart();

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const shipping = calculateShipping();
  const total = calculateTotal();

  // Image URL helper
  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${import.meta.env.VITE_BACKEND_URL}/api/v1/files${imagePath}`;
    return `${import.meta.env.VITE_BACKEND_URL}/api/v1/files/images/${imagePath}`;
  };

  // ✅ Clear cart handler
  const handleClearCart = async () => {
    try {
      const success = await clear();
      if (success) {
        setNotification({
          type: 'success',
          message: 'Sepet temizlendi',
        });
      }
    } catch {
      setNotification({ type: 'error', message: 'Hata oluştu' });
    }
  };

  if (loading && isEmpty) {
    return (
      <DashboardLayout>
        <div className="min-h-screen py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-32 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-gray-50 to-blue-50"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Sepetim</h1>
            <p className="text-gray-600 mt-2">{items.length} ürün</p>
          </div>

          {notification && (
            <div className={`mb-6 p-4 rounded-lg animate-in fade-in slide-in-from-top ${
              notification.type === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              <p className={notification.type === 'error' ? 'text-red-600' : 'text-green-600'}>
                {notification.message}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {isEmpty ? (
            <div className="bg-white/90 rounded-lg p-12 text-center shadow-xl">
              <ShoppingCart size={64} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h2>
              <p className="text-gray-600 mb-6">Şimdi alışverişe başla ve ürün ekle</p>
              <button
                onClick={() => navigate('/')}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left - Items */}
              <div className="lg:col-span-2">
                <div className="bg-white/90 rounded-lg overflow-hidden shadow-xl">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-200/50 last:border-b-0 p-6 flex gap-6 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                        {item.productImage ? (
                          <img
                            src={getImageUrl(item.productImage)}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image load failed:', item.productImage);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">{item.productName}</h3>
                        <p className="text-2xl font-bold text-cyan-500">
                          ₺{item.unitPrice.toLocaleString('tr-TR')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrement(item.id)}
                          disabled={syncInProgress}
                          className="p-2 hover:bg-gray-100/80 rounded transition disabled:opacity-50"
                        >
                          <Minus size={18} className="text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increment(item.id)}
                          disabled={syncInProgress}
                          className="p-2 hover:bg-gray-100/80 rounded transition disabled:opacity-50"
                        >
                          <Plus size={18} className="text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={syncInProgress}
                        className="p-2 text-red-500 hover:bg-red-50/80 rounded transition disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white/90 rounded-lg p-6 sticky top-24 shadow-xl">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>

                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200/50">
                    <div className="flex justify-between text-gray-600">
                      <span>Ara Toplam</span>
                      <span>₺{totals.totalPrice.toLocaleString('tr-TR')}</span>
                    </div>
                    

                    <div className="flex justify-between">
                      <span className="text-gray-600">Kargo</span>
                      <span className={shipping === 0 ? 'text-green-500 font-semibold' : 'text-gray-600'}>
                        {shipping === 0 ? 'Ücretsiz' : `₺${shipping.toLocaleString('tr-TR')}`}
                      </span>
                    </div>

                    {shipping === 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-xs text-green-600 font-medium">
                          ✓ Ücretsiz kargo sağlıyor!
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-blue-600 font-medium">
                          ₺{(500 - totals.totalPrice).toLocaleString('tr-TR')} daha harcayın
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-lg font-bold text-gray-900">Toplam</span>
                      <span className="text-2xl font-bold text-cyan-500">
                        ₺{total.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  {syncInProgress && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 flex items-center gap-2">
                      <div className="animate-spin">
                        <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full" />
                      </div>
                      <p className="text-xs text-yellow-600">Güncelleniyor...</p>
                    </div>
                  )}

                  {/* ✅ Clear Cart Button - Top */}
                  <button
                    onClick={handleClearCart}
                    disabled={syncInProgress}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition disabled:opacity-50 shadow-md"
                  >
                    <Trash2 size={18} />
                    Sepeti Temizle
                  </button>

                  {/* Checkout Button */}
                  <button
                    onClick={() => navigate('/checkout')}
                    disabled={syncInProgress || isEmpty}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition disabled:cursor-not-allowed shadow-md"
                  >
                    {syncInProgress ? 'Güncelleniyor...' : 'Ödemeye Geç'}
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    className="w-full mt-3 border-2 border-gray-300/70 hover:border-gray-400/70 text-gray-700 font-bold py-3 rounded-lg transition hover:bg-gray-50"
                  >
                    Alışverişe Devam Et
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}