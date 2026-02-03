import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Package, Truck, CheckCircle, Clock, Home } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useOrder } from '../hooks/useOrder';

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { getOrder, currentOrder, loading } = useOrder();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      getOrder(parseInt(orderId)).then((result) => {
        setOrder(result);
      });
    }
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'SHIPPED':
        return <Truck className="w-8 h-8 text-blue-500" />;
      case 'READY_FOR_SHIPMENT':
      case 'STOCK_RESERVED':
        return <Package className="w-8 h-8 text-yellow-500" />;
      default:
        return <Clock className="w-8 h-8 text-cyan-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'Ödeme Bekleniyor';
      case 'PAYMENT_CONFIRMED':
        return 'Ödeme Onaylandı';
      case 'STOCK_RESERVED':
        return 'Hazırlanıyor';
      case 'READY_FOR_SHIPMENT':
        return 'Gönderime Hazır';
      case 'SHIPPED':
        return 'Kargoya Teslim Edildi';
      case 'DELIVERED':
        return 'Teslim Edildi';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Bekleniyor';
      case 'PAID':
        return 'Ödendi';
      case 'FAILED':
        return 'Başarısız';
      case 'REFUNDED':
        return 'İade Edildi';
      default:
        return status;
    }
  };

  if (loading && !order) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4" />
            <p className="text-gray-600">Sipariş yükleniyor...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayOrder = order || currentOrder;

  if (!displayOrder) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Sipariş bulunamadı</p>
            <button
              onClick={() => navigate('/')}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusStages = [
    { status: 'AWAITING_PAYMENT', label: 'Ödeme Bekleniyor' },
    { status: 'PAYMENT_CONFIRMED', label: 'Ödeme Onaylandı' },
    { status: 'STOCK_RESERVED', label: 'Hazırlanıyor' },
    { status: 'READY_FOR_SHIPMENT', label: 'Gönderime Hazır' },
    { status: 'SHIPPED', label: 'Kargoya Verildi' },
    { status: 'DELIVERED', label: 'Teslim Edildi' },
  ];

  const currentStageIndex = statusStages.findIndex(s => s.status === displayOrder.status);

  return (
    <DashboardLayout>
      <div className="min-h-screen py-12 bg-gradient-to-br from-cyan-50 via-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Siparişiniz Alındı!
            </h1>
            <p className="text-gray-600 text-lg mb-1">
              Siparişiniz başarıyla oluşturuldu ve işleme alınıyor.
            </p>
            <p className="text-gray-500">
              Sipariş No: <span className="font-bold text-gray-900">{displayOrder.orderNumber}</span>
            </p>
          </div>

          {/* Payment Status Banner */}
          <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ödeme Durumu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getPaymentStatusText(displayOrder.paymentStatus)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tutar</p>
                <p className="text-2xl font-bold text-cyan-500">
                  ₺{displayOrder.totalPrice.toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="mb-12 bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Sipariş Durumu</h2>
            
            <div className="space-y-4">
              {statusStages.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div key={stage.status}>
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-cyan-500 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            isCurrent ? 'text-cyan-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {stage.label}
                        </p>
                      </div>
                      {isCurrent && <span className="text-cyan-600 text-sm font-bold">ŞIMDI</span>}
                    </div>

                    {index < statusStages.length - 1 && (
                      <div className="ml-5 mt-2 mb-2 h-8 w-0.5 bg-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Teslimat Adresi</h3>
              <p className="text-gray-700 whitespace-pre-wrap mb-2">
                {displayOrder.shippingAddress}
              </p>
              <p className="text-gray-600 text-sm">{displayOrder.phoneNumber}</p>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Sipariş Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sipariş Tarihi:</span>
                  <span className="font-semibold">
                    {new Date(displayOrder.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ödeme Yöntemi:</span>
                  <span className="font-semibold">
                    {displayOrder.paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' :
                     displayOrder.paymentMethod === 'DEBIT_CARD' ? 'Banka Kartı' :
                     'Banka Transferi'}
                  </span>
                </div>
                {displayOrder.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Takip No:</span>
                    <span className="font-semibold">{displayOrder.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Sipariş Ürünleri</h3>
            <div className="space-y-3">
              {displayOrder.items && displayOrder.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Adet: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-cyan-500 whitespace-nowrap ml-4">
                    ₺{(item.unitPrice * item.quantity).toLocaleString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>₺{displayOrder.subtotal.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Kargo</span>
                <span className={displayOrder.shippingCost === 0 ? 'text-green-500 font-semibold' : ''}>
                  {displayOrder.shippingCost === 0 ? 'Ücretsiz' : `₺${displayOrder.shippingCost.toLocaleString('tr-TR')}`}
                </span>
              </div>
              {displayOrder.taxAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Vergi</span>
                  <span>₺{displayOrder.taxAmount.toLocaleString('tr-TR')}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Toplam</span>
                <span className="text-2xl font-bold text-cyan-500">
                  ₺{displayOrder.totalPrice.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition"
            >
              <Home size={20} />
              Alışverişe Devam Et
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg transition"
            >
              <Package size={20} />
              Siparişlerim
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}