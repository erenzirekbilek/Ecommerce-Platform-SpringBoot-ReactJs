import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchCart, selectCartItems, selectCartTotals, updateCartItem } from "../../features/cart/cart.slice";
import { selectAuthUser, selectIsAuthenticated } from "../../features/auth/auth.slice";
import ChatBot from "./ChatBot";
import UserProfileDropdown from "./Userprofiledropdown";
import LoginModal from "../../pages/LoginModal";
import SignupModal from "../../pages/SignupModal";
import { Trash2 } from "lucide-react";
import { clearCart } from "../../features/cart/cart.slice";

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId: number;
  status: boolean;
  displayOrder: number;
  depthLevel: number;
  createdAt: string;
  updatedAt: string;
}

interface SubCategoriesState {
  [key: number]: SubCategory[];
}

interface Props {
  children: ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  // ===== HOOKS =====
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // ===== REDUX STATE =====
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const cartItems = useAppSelector(selectCartItems);
  const { totalPrice } = useAppSelector(selectCartTotals);

  // ===== LOCAL STATE =====
  const [categories] = useState<Category[]>([
    { id: 1, name: "Bilgisayar" },
    { id: 2, name: "Tablet" },
    { id: 3, name: "Aksesuarlar" },
    { id: 4, name: "Elektrik" },
    { id: 5, name: "Gaming" },
  ]);

  const [subCategories, setSubCategories] = useState<SubCategoriesState>({});
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ===== SEPET YÜKLEMESİ =====
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      dispatch(fetchCart(user.id));
    }
  }, [user?.id, isAuthenticated, dispatch]);

  // ===== HANDLERS =====
  const fetchSubCategories = async (categoryId: number): Promise<void> => {
    if (subCategories[categoryId]) {
      setActiveCategory(categoryId);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/v1/categories/${categoryId}/subcategories`
      );

      if (!response.ok) throw new Error("Kategoriler yüklenemedi");

      const data = await response.json();
      setSubCategories((prev) => ({
        ...prev,
        [categoryId]: data.data || [],
      }));
      setActiveCategory(categoryId);
    } catch (error) {
      console.error("Kategori yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(`/search?q=${encodeURIComponent(query)}&page=1`);
    setSearchQuery("");
  };

  const handleOpenCart = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    navigate("/checkout");
  };

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
const handleClearCart = () => {
  if (!user?.id) return;

  const ok = window.confirm("Sepeti tamamen temizlemek istiyor musunuz?");
  if (!ok) return;

  dispatch(clearCart(user.id));
};
  // ===== CALCULATIONS =====
  const shipping = totalPrice > 500 ? 0 : 50;
  const total = totalPrice + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="bg-cyan-400 text-white py-2 px-6 text-center text-sm">
          <p>Ücretsiz Kargo 500₺ Üzeri | Son Fırsat -40%</p>
        </div>

        <nav className="px-6 py-4 flex items-center justify-between gap-8">
          <button 
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-gray-900 hover:text-cyan-500 transition cursor-pointer whitespace-nowrap"
          >
            TechHub
          </button>

          <div className="flex items-center gap-8 relative flex-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="relative group"
                onMouseEnter={() => fetchSubCategories(cat.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <button
                  onClick={() => navigate(`/products/${cat.id}?name=${cat.name}`)}
                  className="text-gray-700 hover:text-cyan-500 transition py-2 whitespace-nowrap"
                >
                  {cat.name}
                </button>

                {activeCategory === cat.id && (
                  <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {loading ? (
                      <div className="px-4 py-3 text-sm text-gray-500">Yükleniyor...</div>
                    ) : subCategories[cat.id] && subCategories[cat.id].length > 0 ? (
                      <ul className="py-2">
                        {subCategories[cat.id].map((subCat) => (
                          <li key={subCat.id}>
                            <button
                              onClick={() => navigate(`/products/${cat.id}?page=1&sort=newest&q=&name=${cat.name}&subCategory=${subCat.slug}`)}
                              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition text-sm"
                            >
                              {subCat.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">Alt kategori yok</div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:flex">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl">
            <button 
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder="Ürün ara..."]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }}
              className="md:hidden p-2 text-gray-700 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-all duration-200 active:scale-90 group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            <button className="p-2 text-gray-700 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-all duration-200 active:scale-90 group">
              <svg className="w-4 h-4 transition-transform group-hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </button>

            <button
              onClick={handleOpenCart}
              className="relative p-2 text-gray-700 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-all duration-200 active:scale-90 group"
            >              
              <svg className="w-4 h-4 transition-transform group-hover:bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-0 2.1-0.754 2.352-1.847l1.32-5.744a1.125 1.125 0 00-1.066-1.369H9.25m-1.75 8.943l-0.536 2.144m0 0a1.125 1.125 0 01-1.065 0.856H5.25m1.5-1.25a1.125 1.125 0 102.25 0 1.125 1.125 0 00-2.25 0zm13.5 0a1.125 1.125 0 102.25 0 1.125 1.125 0 00-2.25 0z" />
              </svg>
              <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white ring-1 ring-white group-hover:bg-cyan-500 transition-colors">
                {cartItems.length}
              </span>
            </button>

            {isAuthenticated ? (
              <UserProfileDropdown />
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="relative p-2 text-gray-700 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-all duration-200 active:scale-90 group"
              >              
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15a7.488 7.488 0 00-5.982 3.725M9 9a3 3 0 106 0 3 3 0 00-6 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      {!isCartOpen && <ChatBot />}

      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">TechHub</h4>
              <p className="text-sm">En iyi teknoloji ürünleri güvenli bir şekilde evine kadar.</p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Kategoriler</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate("/products/1?name=Bilgisayar")} className="hover:text-white transition">Bilgisayarlar</button></li>
                <li><button onClick={() => navigate("/products/2?name=Tablet")} className="hover:text-white transition">Tabletler</button></li>
                <li><button onClick={() => navigate("/products/3?name=Aksesuarlar")} className="hover:text-white transition">Aksesuarlar</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">İletişim</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 0212 XXX XX XX</li>
                <li>📧 info@techhub.com</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Bizi Takip Et</h4>
              <div className="flex gap-4 text-sm">
                <button className="hover:text-cyan-400 transition">Instagram</button>
                <button className="hover:text-cyan-400 transition">Twitter</button>
                <button className="hover:text-cyan-400 transition">Facebook</button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 TechHub. Tüm Hakları Saklıdır.</p>
          </div>
        </div>
      </footer>

      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ease-in-out ${
        isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`} onClick={() => setIsCartOpen(false)} />

      <aside className={`fixed right-0 h-screen w-full max-w-[420px] bg-white shadow-2xl flex flex-col z-40 transition-transform duration-500 ease-in-out ${
        isCartOpen ? "translate-x-0" : "translate-x-full"
      }`} style={{ top: "130px", height: "calc(100vh - 130px)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b bg-white sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-xl text-gray-800">Sepetim</h2>
            <span className="bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded-full text-xs font-medium">{cartItems.length} Ürün</span>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
        </div>
        

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4">🛒</div>
              <p className="text-gray-500 text-sm">Sepetiniz şu an boş.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-white rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
                    {item.productImage ? (
                      <img
                        src={`http://localhost:8082${item.productImage}`}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-800 truncate">{item.productName}</h3>
                    <p className="text-cyan-500 font-bold text-sm mt-1">₺{item.unitPrice.toLocaleString('tr-TR')}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded">
                      <button
                        onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                        className="p-1 hover:bg-gray-100 transition"
                      >
                        <Minus size={14} className="text-gray-600" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                        className="p-1 hover:bg-gray-100 transition"
                      >
                        <Plus size={14} className="text-gray-600" />
                      </button>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-6 bg-gray-50/50 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Ara Toplam</span>
              <span>₺{totalPrice.toLocaleString('tr-TR')}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Kargo</span>
              <span className={shipping === 0 ? "text-cyan-500 font-semibold" : ""}>{shipping === 0 ? "Ücretsiz" : `₺${shipping.toLocaleString('tr-TR')}`}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-gray-800 font-semibold">Toplam</span>
            <span className="text-xl font-bold text-cyan-500">₺{total.toLocaleString('tr-TR')}</span>
          </div>
          <button onClick={handleCheckout} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-cyan-200 transition-all active:scale-[0.98]">
            Ödemeye Geç
          </button>
          {cartItems.length > 0 && (
  <button
    onClick={handleClearCart}
    className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold transition shadow-md"
  >
    <Trash2 size={16} />
    Sepeti Temizle
  </button>
)}
          <button onClick={() => navigate("/")} className="w-full text-gray-600 hover:text-gray-800 text-sm py-2">Alışverişe Devam Et</button>
        </div>
      </aside>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSwitchToSignup={() => { setIsLoginOpen(false); setIsSignupOpen(true); }} />
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} onSwitchToLogin={() => { setIsSignupOpen(false); setIsLoginOpen(true); }} />
    </div>
  );
};

export default DashboardLayout;