import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useOrder } from '../hooks/useOrder';

export default function OrdersPage() {
  const navigate = useNavigate();
  const {
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    totalElements,
    getUserOrders,
  } = useOrder();

  const [pageNum, setPageNum] = useState(1);

  useEffect(() => {
    // Redux hook'u getCurrentPage 0-based döndürüyor, UI için 1-based kullan
    getUserOrders(pageNum, 10).catch((err) => {
      console.error('Siparişler yüklenirken hata:', err);
    });
  }, [pageNum, getUserOrders]);

  const getStatusIcon = (status: string) => {
    if (status === 'DELIVERED') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status === 'SHIPPED') {
      return <Truck className="w-5 h-5 text-blue-500" />;
    }
    if (status === 'STOCK_RESERVED') {
      return <Package className="w-5 h-5 text-yellow-500" />;
    }
    return <Clock className="w-5 h-5 text-cyan-500" />;
  };

  const getStatusText = (status: string) => {
    const statuses: { [key: string]: string } = {
      DELIVERED: 'Teslim Edildi',
      SHIPPED: 'Kargoya Teslim',
      STOCK_RESERVED: 'Hazırlanıyor',
      READY_FOR_SHIPMENT: 'Gönderime Hazır',
      PAYMENT_CONFIRMED: 'Ödeme Onaylandı',
      AWAITING_PAYMENT: 'Ödeme Bekleniyor',
      CANCELLED: 'İptal Edildi',
    };
    return statuses[status] || 'İşleniyor';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen py-8 bg-gradient-to-br from-cyan-50 via-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
            <p className="text-gray-600 mt-2">
              {totalElements > 0 ? `${totalElements} sipariş` : 'Henüz sipariş yok'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-semibold">⚠️ {error}</p>
              <button
                onClick={() => getUserOrders(pageNum, 10)}
                className="mt-2 text-red-600 hover:text-red-800 underline font-semibold"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && orders.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full" />
              </div>
              <p className="ml-4 text-gray-600">Siparişler yükleniyor...</p>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Henüz sipariş yok
              </h2>
              <p className="text-gray-600 mb-6">
                Hemen alışverişe başla ve ilk siparişini oluştur
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() =>
                    navigate(`/order-confirmation/${order.id}`, {
                      state: { order },
                    })
                  }
                  className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition cursor-pointer border-l-4 ${
                    order.status === 'DELIVERED'
                      ? 'border-green-500'
                      : order.status === 'SHIPPED'
                      ? 'border-blue-500'
                      : order.status === 'CANCELLED'
                      ? 'border-red-500'
                      : 'border-cyan-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(order.status)}
                        <p className="text-sm font-semibold text-gray-600">
                          {getStatusText(order.status)}
                        </p>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Sipariş #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Ürün Sayısı
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {order.items?.length || 0} ürün
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Tutar
                      </p>
                      <p className="text-lg font-bold text-cyan-500">
                        ₺{(order.totalPrice || 0).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Ödeme
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          order.paymentStatus === 'PAID'
                            ? 'text-green-600'
                            : 'text-yellow-600'
                        }`}
                      >
                        {order.paymentStatus === 'PAID'
                          ? '✓ Ödendi'
                          : order.paymentStatus === 'PENDING'
                          ? 'Beklemede'
                          : order.paymentStatus === 'FAILED'
                          ? 'Başarısız'
                          : 'İşleniyor'}
                      </p>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Kargo No
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && orders.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setPageNum(Math.max(1, pageNum - 1))}
                disabled={pageNum === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-semibold"
              >
                ← Önceki
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const page = pageNum + i;
                if (page > totalPages) return null;

                return (
                  <button
                    key={page}
                    onClick={() => setPageNum(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      pageNum === page
                        ? 'bg-cyan-500 text-white'
                        : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setPageNum(Math.min(totalPages, pageNum + 1))}
                disabled={pageNum >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-semibold"
              >
                Sonraki →
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}