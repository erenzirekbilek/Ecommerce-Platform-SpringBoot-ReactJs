import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { 
  fetchCart, 
  removeFromCart, 
  updateCartItem, 
  clearCart,
  selectCartItems,
  selectCartLoading,
  selectCartError,
  selectCartTotals
} from '../features/cart/cart.slice';
import { selectAuthUser } from '../features/auth/auth.slice';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux'dan state'leri çek
  const user = useAppSelector(selectAuthUser);
  const items = useAppSelector(selectCartItems);
  const loading = useAppSelector(selectCartLoading);
  const error = useAppSelector(selectCartError);
  const { totalPrice } = useAppSelector(selectCartTotals);

  // Component mount'da sepeti yükle
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [user?.id, dispatch]);

  // Miktar artır
  const handleIncreaseQuantity = (cartItemId: number, currentQuantity: number) => {
    if (user?.id) {
      dispatch(updateCartItem({
        userId: user.id,
        cartItemId,
        quantity: currentQuantity + 1
      }));
    }
  };

  // Miktar azalt
  const handleDecreaseQuantity = (cartItemId: number, currentQuantity: number) => {
    if (currentQuantity > 1 && user?.id) {
      dispatch(updateCartItem({
        userId: user.id,
        cartItemId,
        quantity: currentQuantity - 1
      }));
    }
  };

  // Ürün sil
  const handleRemoveItem = (cartItemId: number) => {
    if (user?.id) {
      dispatch(removeFromCart({
        userId: user.id,
        cartItemId
      }));
    }
  };

  // Sepeti temizle
  const handleClearCart = () => {
    if (user?.id && window.confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
      dispatch(clearCart(user.id));
    }
  };

  // Ödemeye geç
  const handleCheckout = () => {
    if (items.length > 0) {
      navigate('/checkout');
    }
  };

  const shipping = totalPrice > 500 ? 0 : 50;
  const total = totalPrice + shipping;

  if (loading && items.length === 0) {
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

          {/* SAYFA BAŞLIĞI */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Sepetim</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {items.length === 0 ? (
            // BOŞ SEPET
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
            // DOLU SEPET
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* SOL TARAF - ÜRÜNLER */}
              <div className="lg:col-span-2">
                <div className="bg-white/90 rounded-lg overflow-hidden shadow-xl">
                  {items.map((item) => (
                    <div key={item.id} className="border-b border-gray-200/50 last:border-b-0 p-6 flex gap-6 hover:bg-gray-50/50 transition-colors">
                      
                      {/* RESİM */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {item.productImage ? (
                          <img
                            src={`http://localhost:8082${item.productImage}`}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>

                      {/* BİLGİLER */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">{item.productName}</h3>
                        <p className="text-2xl font-bold text-cyan-500">
                          ₺{item.unitPrice.toLocaleString('tr-TR')}
                        </p>
                      </div>

                      {/* MİKTAR KONTROLLERİ */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDecreaseQuantity(item.productId, item.quantity)}
                          disabled={loading}
                          className="p-2 hover:bg-gray-100/80 rounded transition disabled:opacity-50"
                        >
                          <Minus size={18} className="text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleIncreaseQuantity(item.productId, item.quantity)}
                          disabled={loading}
                          className="p-2 hover:bg-gray-100/80 rounded transition disabled:opacity-50"
                        >
                          <Plus size={18} className="text-gray-600" />
                        </button>
                      </div>

                      {/* SİL BUTONU */}
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={loading}
                        className="p-2 text-red-500 hover:bg-red-50/80 rounded transition disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}

                  {/* SEPET TEMIZLE BUTONU */}
                  <div className="p-6 bg-gray-50/50 border-t border-gray-200/50">
                    <button
                      onClick={handleClearCart}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
                    >
                      Sepeti Temizle
                    </button>
                  </div>
                </div>
              </div>

              {/* SAĞ TARAF - ÖZETİ */}
              <div className="lg:col-span-1">
                <div className="bg-white/90 rounded-lg p-6 sticky top-24 shadow-xl">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>

                  {/* HESAPLAMA */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200/50">
                    <div className="flex justify-between text-gray-600">
                      <span>Ara Toplam</span>
                      <span>₺{totalPrice.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Kargo</span>
                      <span className={shipping === 0 ? 'text-green-500 font-semibold' : ''}>
                        {shipping === 0 ? 'Ücretsiz' : `₺${shipping.toLocaleString('tr-TR')}`}
                      </span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-sm text-green-600">✓ Ücretsiz kargo sağlıyor!</p>
                    )}
                  </div>

                  {/* TOPLAM */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-lg font-bold text-gray-900">Toplam</span>
                      <span className="text-2xl font-bold text-cyan-500">
                        ₺{total.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  {/* CHECKOUT BUTONU */}
                  <button
                    onClick={handleCheckout}
                    disabled={loading || items.length === 0}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 shadow-md"
                  >
                    {loading ? 'Yükleniyor...' : 'Ödemeye Geç'}
                  </button>

                  {/* DEVAM ETME BUTONU */}
                  <button
                    onClick={() => navigate('/')}
                    className="w-full mt-3 border-2 border-gray-300/70 hover:border-gray-400/70 text-gray-700 font-bold py-3 rounded-lg transition"
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