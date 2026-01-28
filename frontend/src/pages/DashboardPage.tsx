import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import heroProduct from '../assets/images/background-home-page.png';

/**
 * ============================
 * TYPE DEFINITIONS
 * ============================
 * UI tarafında kategori kartlarında kullanılacak veri modeli
 */
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: number | null;
}

/**
 * ============================
 * HERO SECTION
 * ============================
 * UX: Sayfaya girildiğinde ilk görülen alan
 * Amaç:
 * - Dikkat çekmek
 * - Ana ürünü veya kampanyayı vurgulamak
 * - Kullanıcıyı aksiyona yönlendirmek
 */
const HeroSection = ({ backgroundImage }: { backgroundImage: string }) => (
  <section 
    className="bg-cover bg-left bg-no-repeat py-32 px-6 relative"
    style={{
      /**
       * UI:
       * - Arka plan görseli
       * UX:
       * - Sol tarafta cyan gradient → metin okunurluğu
       * - Sağ taraf görsel → premium hissi
       */
      backgroundImage: `linear-gradient(to left, rgba(34, 211, 238, 0.95) 0%, rgba(34, 211, 238, 0.7) 50%, rgba(255, 255, 255, 0) 100%), url(${backgroundImage})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }}
  >
    <div className="max-w-7xl mx-auto flex justify-end">
      <div className="max-w-2xl text-right flex flex-col items-end">

        {/* Küçük üst etiket → ürün / seri adı */}
        <p className="text-white text-sm mb-3 font-semibold uppercase tracking-wider">
          TECH HUB XT-25
        </p>

        {/* Ana başlık → hero mesaj */}
        <h2 className="text-5xl font-bold text-white leading-tight mb-4">
          Geleceğin Teknolojisi <br /> Bugün Burada <br />
        </h2>

        {/* Açıklama → değer önerisi */}
        <p className="text-white text-lg mb-6 opacity-90">
          Son teknoloji ile ev temizliği artık daha kolay, daha hızlı ve daha etkili.
        </p>

        {/* CTA BUTTON */}
        {/* UX: Kullanıcıyı ürün detayına yönlendir */}
        <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 w-fit">
          <span>Ürünü Gözden Geçir</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  </section>
);

/**
 * ============================
 * CATEGORIES SECTION
 * ============================
 * UX:
 * - Kullanıcıya "nereden başlasam?" sorusunun cevabı
 * - Kategori bazlı keşif
 */
const CategoriesSection = ({ onCategorySelect }: { onCategorySelect: (categoryId: number, categoryName: string) => void }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * UX:
   * - Slider / carousel hissi
   * - Aynı sayfada kaydırma
   */
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  /**
   * Sayfa açıldığında kategorileri çek
   */
  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/v1/categories`);

        if (!response.ok) {
          throw new Error('Kategoriler yüklenemedi');
        }

        const result = await response.json();

        /**
         * UI:
         * - Kategori kartları burada render edilecek
         */
        setCategories(result.data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const currentCategories = categories.slice(currentIndex, currentIndex + itemsPerPage);

  const handleNext = () => {
    if (currentIndex + itemsPerPage < categories.length) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };

  /**
   * ============================
   * LOADING STATE
   * ============================
   * UX:
   * - Beyaz ekran yerine skeleton
   */
  if (loading) {
    return (
      <section className="py-16 px-6 bg-[#E0F7F6]/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-12">Kategoriler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl h-96 animate-pulse border border-gray-200 shadow-sm" 
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /**
   * ============================
   * ERROR STATE
   * ============================
   * UX:
   * - Kullanıcıya ne olduğunu açıkça söyle
   */
  if (error) {
    return (
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Kategoriler</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Hata: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * ============================
   * CATEGORY GRID
   * ============================
   */
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-3xl font-bold text-gray-900 mb-12">Kategoriler</h3>
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* KATEGORİ KARTI */}
            {currentCategories.map((cat: Category) => (
              <div 
                key={cat.id} 
                className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition group cursor-pointer flex flex-col"
                onClick={() => onCategorySelect(cat.id, cat.name)}
              >

                {/* KATEGORİ GÖRSELİ */}
                <div className="relative h-64 w-full overflow-hidden bg-white flex-shrink-0">
                  <img 
                    src={`${import.meta.env.VITE_BACKEND_URL}${cat.imageUrl}`} 
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* KATEGORİ METİN ALANI */}
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-cyan-500 transition">
                    {cat.name}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1 flex-grow">
                    {cat.description}
                  </p>

                  {/* CTA */}
                  <button className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold transition">
                    Ürünleri Görüntüle
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SAĞ / SOL OKLAR */}
          {categories.length > itemsPerPage && (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white border rounded-full p-3 shadow-lg disabled:opacity-50"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex + itemsPerPage >= categories.length}
                className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white border rounded-full p-3 shadow-lg disabled:opacity-50"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* DOT PAGINATION */}
        <div className="flex justify-center gap-2 mt-12">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * itemsPerPage)}
              className={`w-3 h-3 rounded-full ${
                Math.floor(currentIndex / itemsPerPage) === idx
                  ? 'bg-cyan-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * ============================
 * DASHBOARD PAGE
 * ============================
 * UX:
 * - Hero → Keşif → Sosyal kanıt → Kampanya
 */
export default function DashboardPage(): JSX.Element {
  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    // UX: Kategoriye tıklayınca ürün listesine git
    window.location.href = `/products/${categoryId}?name=${categoryName}`;
  };

  return (
    <DashboardLayout>
      <HeroSection backgroundImage={heroProduct} />
      <CategoriesSection onCategorySelect={handleCategorySelect} />
    </DashboardLayout>
  );
}