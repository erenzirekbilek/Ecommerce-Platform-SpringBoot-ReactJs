import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAppSelector } from '../app/hooks';
import { selectAuthUser } from '../features/auth/auth.slice';
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';

interface FormData {
  shippingAddress: string;
  billingAddress: string;
  phoneNumber: string;
  paymentMethod: string;
  useSameAddress: boolean;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const { items, totals, clear } = useCart();
  const { createOrder, creating, error } = useOrder();

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    shippingAddress: '',
    billingAddress: '',
    phoneNumber: '',
    paymentMethod: 'CREDIT_CARD',
    useSameAddress: true,
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!user?.id || items.length === 0) {
      navigate('/cart');
    }
  }, [user?.id, items.length, navigate]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.shippingAddress.trim()) {
      setNotification({ type: 'error', message: 'Teslimat adresi zorunludur' });
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setNotification({ type: 'error', message: 'Telefon numarası zorunludur' });
      return false;
    }
    if (!formData.useSameAddress && !formData.billingAddress.trim()) {
      setNotification({ type: 'error', message: 'Fatura adresi zorunludur' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    const orderData = {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      shippingAddress: formData.shippingAddress,
      billingAddress: formData.useSameAddress ? formData.shippingAddress : formData.billingAddress,
      phoneNumber: formData.phoneNumber,
      paymentMethod: formData.paymentMethod,
      shippingCost: totals.totalPrice > 500 ? 0 : 50,
      taxAmount: 0,
    };

    const result = await createOrder(orderData);
    
    // Sepeti temizle (bu hemen yapılır)
    await clear();
    
    // 2 saniye beklettikten sonra yönlendir
    setTimeout(() => {
      navigate(`/order-confirmation/${result.id}`, { state: { order: result } });
    }, 2000);
  } catch (err) {
    setNotification({
      type: 'error',
      message: 'Sipariş oluşturulurken bir hata oluştu',
    });
  }
};

  const shipping = totals.totalPrice > 500 ? 0 : 50;
  const total = totals.totalPrice + shipping;

  return (
    <DashboardLayout>
      <div className="min-h-screen py-8 bg-gradient-to-br from-cyan-50 via-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate('/cart')}
              className="text-cyan-500 hover:text-cyan-600 transition"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Ödeme</h1>
          </div>

          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                notification.type === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              <p
                className={
                  notification.type === 'error' ? 'text-red-600' : 'text-green-600'
                }
              >
                {notification.message}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Teslimat Adresi
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teslimat Adresi *
                      </label>
                      <textarea
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                        placeholder="Mahalle, sokak, bina no vb..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon Numarası *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                        placeholder="+90 5XX XXX XX XX"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Fatura Adresi
                  </h2>

                  <label className="flex items-center gap-3 mb-6 cursor-pointer">
                    <input
                      type="checkbox"
                      name="useSameAddress"
                      checked={formData.useSameAddress}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-gray-700">
                      Teslimat adresi ile aynı
                    </span>
                  </label>

                  {!formData.useSameAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fatura Adresi *
                      </label>
                      <textarea
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                        placeholder="Mahalle, sokak, bina no vb..."
                      />
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Ödeme Yöntemi
                  </h2>

                  <div className="space-y-4">
                    {[
                      { value: 'CREDIT_CARD', label: '💳 Kredi Kartı' },
                      { value: 'DEBIT_CARD', label: '💳 Banka Kartı' },
                      { value: 'BANK_TRANSFER', label: '🏦 Banka Transferi' },
                    ].map((method) => (
                      <label key={method.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 cursor-pointer transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700 font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {creating && <Loader size={20} className="animate-spin" />}
                  {creating ? 'İşleniyor...' : 'Siparişi Tamamla'}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 sticky top-24 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Sipariş Özeti
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.productName} x{item.quantity}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₺{(item.unitPrice * item.quantity).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-semibold">
                      ₺{totals.totalPrice.toLocaleString('tr-TR')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Kargo</span>
                    <span
                      className={
                        shipping === 0 ? 'text-green-500 font-semibold' : ''
                      }
                    >
                      {shipping === 0 ? 'Ücretsiz' : `₺${shipping.toLocaleString('tr-TR')}`}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      Toplam
                    </span>
                    <span className="text-2xl font-bold text-cyan-500">
                      ₺{total.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  ✓ Güvenli ödeme ile korunuyor
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}