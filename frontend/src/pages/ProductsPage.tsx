import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Search, Filter, Grid3x3, List } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

// ===== TİPLER =====
interface Product {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  parentCategoryNames: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  brandId?: number;
  brandName?: string;
}

interface Brand {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

// ===== COMPONENT =====
export default function ProductsPage() {
  // HOOKS
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryName = searchParams.get('name');

  // STATE - ÜRÜNLER
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1
  );
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // STATE - FİLTRELER
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('q') || ''
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState(
    searchParams.get('sort') || 'newest'
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  
  // STATE - ALT KATEGORİLER
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(
    searchParams.get('subCategory') || ''
  );

  // ===== STATE DEĞİŞİNCE URL'Yİ GÜNCELLE =====
  useEffect(() => {
    setSearchParams({
      page: String(currentPage),
      sort: sortBy,
      q: searchQuery,
      name: categoryName || '',
      subCategory: selectedSubCategory || '',
    });
  }, [currentPage, sortBy, searchQuery, selectedSubCategory]);

  useEffect(() => {
    setCurrentPage(Number(searchParams.get('page')) || 1);
    setSortBy(searchParams.get('sort') || 'newest');
    setSearchQuery(searchParams.get('q') || '');
    setSelectedSubCategory(searchParams.get('subCategory') || '');
  }, [searchParams]);

  // ===== ALT KATEGORİLERİ ÇEK =====
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const url = `${apiUrl}/v1/categories?parent=${categoryId}`;
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          const subs = result.content || [];
          setSubCategories(subs);
        }
      } catch (error) {
        console.error('Alt kategoriler yükleme hatası:', error);
      }
    };

    if (categoryId) fetchSubCategories();
  }, [categoryId]);

  // ===== ÜRÜNLERI ÇEK =====
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsTransitioning(true);
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        const pageSize = 12;
        const sortByMap: { [key: string]: string } = {
          newest: 'createdAt',
          'price-low': 'price',
          'price-high': 'price',
          rating: 'rating',
        };
        const sortField = sortByMap[sortBy] || 'createdAt';
        const sortDirection = sortBy === 'price-low' ? 'ASC' : 'DESC';

        const params = new URLSearchParams();
        params.append('page', String(currentPage - 1));
        params.append('size', String(pageSize));
        params.append('sortBy', sortField);
        params.append('direction', sortDirection);
        
        if (searchQuery) {
          params.append('keyword', searchQuery);
        }

        // ALT KATEGORİ SEÇİLİYSE, ALT KATEGORİ ENDPOİNTİNİ KUL
        let url = '';
        if (selectedSubCategory && categoryId) {
          url = `${apiUrl}/v1/products/category/${categoryId}/parent-category?slug=${selectedSubCategory}&${params.toString()}`;
        } else {
          url = `${apiUrl}/v1/products/category/${categoryId}?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const result = await response.json();
        
        const productList = result.content || [];
        
        console.log('API Response:', result);
        console.log('Product List:', productList);
        
        const filtered = productList.filter((product: Product) => {
          const matchesPrice =
            product.price >= priceRange[0] &&
            product.price <= priceRange[1];
          const matchesBrand = selectedBrands.length === 0 || (product.brandId && selectedBrands.includes(product.brandId));
          return matchesPrice && matchesBrand;
        });

        setTimeout(() => {
          setProducts(filtered);
          setTotalPages(result.totalPages || 0);
          setTotalElements(result.totalElements || 0);
          setIsTransitioning(false);
        }, 300);

        const uniqueBrands = Array.from(
          new Map(
            productList
              .filter((p: Product) => p.brandId && p.brandName)
              .map((p: Product) => [p.brandId, { id: p.brandId, name: p.brandName }])
          ).values()
        ) as Brand[];
        
        setBrands(uniqueBrands);
      } catch (error) {
        console.error('Ürünler yükleme hatası:', error);
        setProducts([]);
        setTotalPages(0);
        setIsTransitioning(false);
      } finally {
        setLoading(false);
      }
    };
    
    if (categoryId) fetchProducts();
  }, [categoryId, currentPage, sortBy, searchQuery, priceRange, selectedBrands, selectedSubCategory]);

  // ===== FİLTRELE =====
  useEffect(() => {
    const filtered = products
      .filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesPrice =
          product.price >= priceRange[0] &&
          product.price <= priceRange[1];
        const matchesBrand = selectedBrands.length === 0 || (product.brandId && selectedBrands.includes(product.brandId));
        return matchesSearch && matchesPrice && matchesBrand;
      });

    setFilteredProducts(filtered);
  }, [searchQuery, priceRange, products, selectedBrands]);

  const currentProducts = filteredProducts;
  const maxPrice = 100000;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  // ===== RENDER =====
  return (
    <DashboardLayout>
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-out {
          animation: fadeOut 0.3s ease-in-out forwards;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in-out forwards;
        }
      `}</style>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

          {/* ===== SAYFA BAŞLIĞI ===== */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {categoryName || 'Ürünler'}
            </h1>
          </div>

          {/* ===== ALT KATEGORİLER ===== */}
          {subCategories.length > 0 && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
              <div className="flex gap-2 min-w-min">
                <button
                  onClick={() => {
                    setSelectedSubCategory('');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full font-medium transition whitespace-nowrap ${
                    !selectedSubCategory
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tümü
                </button>
                {subCategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubCategory(sub.slug);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full font-medium transition whitespace-nowrap ${
                      selectedSubCategory === sub.slug
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== TOOLBAR ===== */}
          <div className="flex gap-3 items-center mb-6 bg-white p-4 rounded-lg shadow-sm flex-wrap">
            {/* ARAMA KUTUSU */}
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-sm"
              />
            </div>

            {/* AYRAÇ */}
            <div className="hidden md:block h-6 border-l border-gray-300"></div>

            {/* GÖRÜNÜM SEÇENEKLERİ */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded transition ${
                  viewType === 'grid'
                    ? 'text-cyan-500 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-cyan-500'
                }`}
                title="Grid Görünüm"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded transition ${
                  viewType === 'list'
                    ? 'text-cyan-500 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-cyan-500'
                }`}
                title="Liste Görünüm"
              >
                <List size={20} />
              </button>
            </div>

            {/* AYRAÇ */}
            <div className="hidden md:block h-6 border-l border-gray-300"></div>

            {/* SIRALAMAA */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 bg-white text-sm font-medium"
            >
              <option value="newest">En Yeni</option>
              <option value="price-low">Düşük Fiyat</option>
              <option value="price-high">Yüksek Fiyat</option>
              <option value="rating">Yüksek Puan</option>
            </select>

            {/* MOBİL FİLTRE BUTONU */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-2 px-3 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
            >
              <Filter size={18} />
            </button>

            {/* ÜRÜN SAYISI BADGE */}
            <div className="flex items-center gap-2 bg-cyan-50 px-3 py-2.5 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">
                {totalElements} ürün
              </span>
            </div>
          </div>

          {/* ===== MAIN CONTENT ===== */}
          <div className="flex gap-8">

            {/* ===== SOL PANEL - FİLTRELER ===== */}
            <aside
              className={`${
                showMobileFilters ? 'block' : 'hidden'
              } md:block w-full md:w-64 flex-shrink-0`}
            >
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-lg mb-6 text-gray-900">Filtreler</h3>

                {/* FİYAT FİLTRESİ */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Fiyat Aralığı
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-700">
                        Min: ₺{priceRange[0].toLocaleString('tr-TR')}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([Number(e.target.value), priceRange[1]])
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">
                        Max: ₺{priceRange[1].toLocaleString('tr-TR')}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* RATING FİLTRESİ */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Puanlamaya Göre
                  </h4>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <label
                        key={star}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <div className="flex text-yellow-400">
                          {[...Array(star)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {star} Yıldız ve Üzeri
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* MARKA FİLTRESİ */}
                {brands.length > 0 && (
                  <div className="mb-8 pb-8 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Marka</h4>
                    <div className="space-y-3">
                      {brands.map((brand) => (
                        <label
                          key={brand.id}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand.id]);
                              } else {
                                setSelectedBrands(
                                  selectedBrands.filter((id) => id !== brand.id)
                                );
                              }
                            }}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {brand.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* FİLTRELERİ SIFIRLA */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange([0, maxPrice]);
                    setSortBy('newest');
                    setSelectedBrands([]);
                    setSelectedSubCategory('');
                  }}
                  className="w-full py-2 text-cyan-500 border border-cyan-500 rounded-lg hover:bg-cyan-50 font-semibold transition"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            </aside>

            {/* ===== ÜRÜN ALANI ===== */}
            <div className={`flex-1 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>

              {/* LOADING SKELETON */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-300 rounded-xl h-72 mb-4" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-20" />
                        <div className="h-4 bg-gray-300 rounded w-3/4" />
                        <div className="h-6 bg-gray-300 rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>

              ) : filteredProducts.length === 0 ? (

                /* EMPTY STATE */
                <div className="text-center py-20 bg-white rounded-lg">
                  <p className="text-lg text-gray-500">
                    Kriterlere uygun ürün bulunmamaktadır.
                  </p>
                </div>

              ) : (
                <>
                  {/* ÜRÜN GÖRÜNÜMÜ */}
                  {viewType === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12 auto-rows-max">
                      {currentProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col h-full"
                        >
                          <div className="bg-gray-100 h-72 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.images?.length ? (
                              <img
                                src={`http://localhost:8082${product.images[0]}`}
                                alt={product.name}
                                onError={(e) => {
                                  console.error('Image load error:', product.images[0], e);
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                                }}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <p className="text-gray-400">Resim Yok</p>
                            )}
                          </div>

                          <div className="p-5 flex flex-col flex-grow">
                            <p className="text-cyan-500 text-xs font-bold mb-2 uppercase tracking-wider">
                              {product.categoryName}
                            </p>

                            <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-1 hover:text-cyan-500 transition">
                              {product.name}
                            </h3>

                            <div className="flex items-center gap-2 mb-4">
                              <div className="flex text-yellow-400 gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} fill="currentColor" />
                                ))}
                              </div>
                              <span className="text-gray-500 text-xs ml-1">
                                ({product.reviewCount})
                              </span>
                            </div>

                            <p className="text-2xl font-bold text-cyan-500 mb-4 h-10 flex items-center">
                              ₺{product.price.toLocaleString('tr-TR')}
                            </p>

                            <button className="w-full bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 mt-4">
                              Sepete Ekle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 mb-12">
                      {currentProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer flex"
                        >
                          <div className="w-48 h-48 flex-shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                            {product.images?.length ? (
                              <img
                                src={`http://localhost:8082${product.images[0]}`}
                                alt={product.name}
                                onError={(e) => {
                                  console.error('Image load error:', product.images[0], e);
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                                }}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <p className="text-gray-400">Resim Yok</p>
                            )}
                          </div>

                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-cyan-500 text-xs font-bold mb-2 uppercase tracking-wider">
                                {product.categoryName}
                              </p>
                              <h3 className="font-bold text-gray-900 text-lg mb-2 hover:text-cyan-500 transition">
                                {product.name}
                              </h3>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {product.description}
                              </p>

                              <div className="flex items-center gap-2">
                                <div className="flex text-yellow-400 gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill="currentColor" />
                                  ))}
                                </div>
                                <span className="text-gray-500 text-sm">
                                  ({product.reviewCount})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <p className="text-2xl font-bold text-cyan-500">
                                ₺{product.price.toLocaleString('tr-TR')}
                              </p>
                              <button className="bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200">
                                Sepete Ekle
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PAGİNATİON KONTROLLER */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-16 pb-8">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={20} className="text-gray-600" />
                        <span className="text-gray-700 font-medium">Önceki</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-lg font-semibold transition ${
                                currentPage === page
                                  ? 'bg-cyan-500 text-white'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <span className="text-gray-700 font-medium">Sonraki</span>
                        <ChevronRight size={20} className="text-gray-600" />
                      </button>
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="text-center text-gray-600 text-sm mb-4">
                      Sayfa {currentPage} / {totalPages}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}