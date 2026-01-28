import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Star, ChevronLeft, ChevronRight, Heart, Share2, ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addToCart } from '../features/cart/cart.slice';
import { selectAuthUser, selectIsAuthenticated } from '../features/auth/auth.slice';
import LoginModal from '../pages/LoginModal';

interface Product {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
}

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProductDetails() {
  // ===== HOOKS =====
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ===== REDUX STATE =====
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  // ===== LOCAL STATE =====
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Mock reviews - backend'den gelecek
  const reviews: Review[] = [
    {
      id: 1,
      author: 'Ahmet K.',
      rating: 5,
      comment: 'Harika bir ürün, kesinlikle tavsiye ederim!',
      date: '2024-01-15'
    },
    {
      id: 2,
      author: 'Fatma T.',
      rating: 4,
      comment: 'Kaliteli ürün, hızlı kargo. İyi bir alışveriş deneyimi.',
      date: '2024-01-10'
    },
    {
      id: 3,
      author: 'Mehmet Y.',
      rating: 5,
      comment: 'Fiyatına göre çok iyi. Çok memnunum.',
      date: '2024-01-05'
    }
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        const url = `${apiUrl}/v1/products/${productId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Ürün yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  // Image Navigation
  const handlePrevImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  // Sepete ekle - Login kontrolü
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }

    if (!user?.id || !product) {
      alert('Kullanıcı veya ürün bilgisi eksik');
      return;
    }

    try {
      await dispatch(addToCart({
        userId: user.id,
        productId: product.id,
        quantity: quantity
      })).unwrap();
      
      alert(`${quantity} adet ${product.name} sepete eklendi!`);
      setQuantity(1);
    } catch (error) {
      alert('Sepete eklenirken hata oluştu');
      console.error('Add to cart error:', error);
    }
  };

  // Favoriye ekle - Login kontrolü
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <section className="bg-gray-50 min-h-screen py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-96 bg-gray-300 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-1/2" />
                <div className="h-6 bg-gray-300 rounded w-1/3" />
              </div>
            </div>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <section className="bg-gray-50 min-h-screen py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-lg text-gray-500">Ürün bulunamadı.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
            >
              Geri Dön
            </button>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section className="bg-gray-50 min-h-screen py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* GERI BUTONU */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-500 hover:text-cyan-600 mb-8 font-medium"
          >
            <ChevronLeft size={20} />
            Geri Dön
          </button>

          {/* MAIN CONTENT */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">

              {/* RESİM BÖLÜMÜ */}
              <div>
                {/* ANA RESİM */}
                <div className="relative bg-gray-100 rounded-xl h-96 md:h-[500px] flex items-center justify-center mb-4 overflow-hidden group">
                  {product.images?.length ? (
                    <>
                      <img
                        src={`http://localhost:8082${product.images[selectedImage]}`}
                        alt={product.name}
                        onError={(e) => {
                          console.error('Image load error:', product.images[selectedImage]);
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3EResim Yüklenemedim%3C/text%3E%3C/svg%3E';
                        }}
                        className="w-full h-full object-cover"
                      />

                      {/* SAĞ SOL BUTONLARI */}
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <ChevronRight size={24} />
                          </button>

                          {/* RESİM SAYISı */}
                          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {selectedImage + 1} / {product.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">Resim Yok</p>
                  )}
                </div>

                {/* KÜÇÜK RESİMLER */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {product.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                          selectedImage === idx
                            ? 'border-cyan-500 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={`http://localhost:8082${image}`}
                          alt={`${product.name} ${idx + 1}`}
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f0f0f0" width="80" height="80"/%3E%3C/svg%3E';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ÜRÜN BİLGİLERİ */}
              <div>
                {/* KATEGORİ */}
                <p className="text-cyan-500 text-sm font-bold uppercase tracking-wider mb-2">
                  {product.categoryName}
                </p>

                {/* BAŞLIK */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* RATING */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex text-yellow-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    ({product.reviewCount} yorum)
                  </span>
                  <span className="text-gray-600">
                    {product.rating.toFixed(1)} / 5.0
                  </span>
                </div>

                {/* FİYAT */}
                <div className="mb-8">
                  <p className="text-gray-600 text-sm mb-2">Fiyat</p>
                  <p className="text-4xl font-bold text-cyan-500">
                    ₺{product.price.toLocaleString('tr-TR')}
                  </p>
                </div>

                {/* AÇIKLAMA */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Açıklama</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* MİKTAR SEÇİMİ */}
                <div className="mb-8 flex items-center gap-4">
                  <p className="font-semibold text-gray-900">Miktar:</p>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="px-6 py-2 font-semibold border-l border-r border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* AKSIYONLAR */}
                <div className="flex gap-4 mb-8">
                  {/* SEPETE EKLE */}
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-4 rounded-lg transition"
                  >
                    <ShoppingCart size={20} />
                    Sepete Ekle ({quantity})
                  </button>

                  {/* FAVORİ */}
                  <button
                    onClick={handleToggleFavorite}
                    className={`px-6 py-4 rounded-lg border-2 transition ${
                      isFavorite
                        ? 'bg-red-50 border-red-500 text-red-500'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>

                  {/* PAYLAŞ */}
                  <button className="px-6 py-4 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition">
                    <Share2 size={20} />
                  </button>
                </div>

                {/* UYARI */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                  ✓ Ücretsiz Kargo (500₺ üzeri siparişlerde)
                </div>
              </div>
            </div>

            {/* YORUMLAR BÖLÜMÜ */}
            <div className="border-t border-gray-200 pt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Müşteri Yorumları</h2>

              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz yorum yapılmamış.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{review.author}</p>
                          <div className="flex text-yellow-400 gap-0.5 my-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < review.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <p className="text-gray-500 text-sm">{review.date}</p>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LOGIN MODAL */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
        }}
      />
    </DashboardLayout>
  );
}