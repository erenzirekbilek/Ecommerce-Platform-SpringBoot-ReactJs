import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ===== TİPLER =====
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  productLink?: { id: number; name: string };
}

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  categoryName: string;
  images: string[];
}

// ===== CHATBOT COMPONENT =====
export default function ChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Merhaba! Ben ALFA asistanınız. Ürünler hakkında sorularınızı yanıtlayabilir ve ürün araması yapabilirim. Örneğin "MacBook var mı?" diye sorabilirsiniz. 😊',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ===== OTOMATIK SCROLL =====
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ===== ÜRÜN ARAMA API =====
  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // Tüm kategorilerdeki ürünleri çek ve filtrele
      const response = await fetch(`${apiUrl}/v1/products?page=0&size=1000`);
      
      if (!response.ok) return [];
      
      const result = await response.json();
      
      // API sonucundan ürünleri al
      const allProducts = Array.isArray(result.content)
        ? result.content
        : Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];

      // Query ile filtrele (kısmi eşleşme)
      const filtered = allProducts.filter((product: Product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );

      return filtered;
    } catch (error) {
      console.error('Ürün arama hatası:', error);
      return [];
    }
  };

  // ===== BOT YANITI OLUŞTUR =====
  const generateBotResponse = async (userMessage: string): Promise<{ text: string; productLink?: { id: number; name: string } }> => {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Kontrol et - "var mı", "bul", "ara" anahtar kelimelerini içeriyorsa veya direkt ürün adı gibi yazıldıysa
    const isProductSearch = 
      lowerMessage.includes('var mı') ||
      lowerMessage.includes('var mı?') ||
      lowerMessage.includes('bul') ||
      lowerMessage.includes('ara') ||
      lowerMessage.includes('varmı') ||
      userMessage.length > 3; // 3 karakterden uzunsa direkt ürün arama yap

    if (isProductSearch && !lowerMessage.includes('teşekkür') && !lowerMessage.includes('sağol') && !lowerMessage.includes('merhaba') && !lowerMessage.includes('selam')) {
      // Soru işaretinden önceki kısmı al
      const searchQuery = userMessage
        .replace(/var\s*mı\??/gi, '')
        .replace(/bul\s*/gi, '')
        .replace(/ara\s*/gi, '')
        .trim();

      if (searchQuery.length > 0) {
        const products = await searchProducts(searchQuery);

        if (products.length > 0) {
          const product = products[0];
          return {
            text: `✅ Evet! "${product.name}" ürünümüz mevcuttur! 
📍 Fiyat: ₺${product.price.toLocaleString('tr-TR')}
⭐ Rating: ${product.rating}/5.0 (${product.reviewCount} yorum)
🏷️ Kategori: ${product.categoryName}`,
            productLink: { id: product.id, name: product.name },
          };
        } else {
          return {
            text: `❌ Maalesef "${searchQuery}" ile ilgili ürün bulamadım. Lütfen farklı bir isimle arama yapabilir misiniz? 🔍`,
          };
        }
      }

      return {
        text: 'Hangi ürünü arıyorsunuz? Ürün adını yazabilir misiniz?',
      };
    }

    // Fiyat sorguları
    if (lowerMessage.includes('fiyat') || lowerMessage.includes('ucuz') || lowerMessage.includes('pahalı')) {
      return {
        text: 'Fiyatlar ürüne göre değişmektedir. Tüm ürünlerimizde en uygun fiyatları sunuyoruz. Hangi ürüne ilgi duyuyorsunuz? 💰',
      };
    }

    // Kargo sorguları
    if (lowerMessage.includes('kargo') || lowerMessage.includes('gönder') || lowerMessage.includes('teslimat')) {
      return {
        text: '500₺ üzeri siparişlerde kargo ücretini biz karşılıyoruz! Siparişiniz 2-3 iş günü içinde teslim edilir. 📦',
      };
    }

    // İade sorguları
    if (lowerMessage.includes('iade') || lowerMessage.includes('geri') || lowerMessage.includes('değişim')) {
      return {
        text: '30 günlük iade ve değişim garantimiz bulunmaktadır. Ürün kullanılmamış halde iade edebilirsiniz. 🔄',
      };
    }

    // Ödeme sorguları
    if (lowerMessage.includes('ödeme') || lowerMessage.includes('kredi') || lowerMessage.includes('taksit')) {
      return {
        text: 'Tüm kredi kartları, banka transferi ve taksit seçenekleri ile ödeme yapabilirsiniz. Güvenli ve hızlı işlemler garanti edilir. 💳',
      };
    }

    // Müşteri hizmetleri
    if (lowerMessage.includes('yardım') || lowerMessage.includes('destek') || lowerMessage.includes('sorun')) {
      return {
        text: 'Size yardımcı olmaktan memnuniyet duyarız! Hangi konuda yardıma ihtiyacınız var? 📞',
      };
    }

    // Teşekkür ifadeleri
    if (lowerMessage.includes('teşekkür') || lowerMessage.includes('sağol') || lowerMessage.includes('eyvallah')) {
      return {
        text: 'Rica ederim! TechHub\'u seçtiğiniz için teşekkür ederiz. 🙏',
      };
    }

    // Selamlaşmalar
    if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam') || lowerMessage.includes('hoşça')) {
      return {
        text: 'Merhaba! Size nasıl yardımcı olabilirim? 👋',
      };
    }

    // Varsayılan yanıt
    return {
      text: 'Ürün araması için "MacBook var mı?" gibi sorular sorabilirsiniz. Ayrıca fiyat, kargo, iade, ödeme veya müşteri hizmetleri hakkında bilgi verebilirim. 😊',
    };
  };

  // ===== MESAJ GÖNDER =====
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    // Kullanıcı mesajı ekle
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Bot yanıtı (1.5 saniye sonra)
    setTimeout(async () => {
      const response = await generateBotResponse(inputValue);
      const botMessage: Message = {
        id: messages.length + 2,
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        productLink: response.productLink,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // ===== ENTER TUŞU =====
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ===== ÜRÜNE GIT =====
  const handleProductClick = (productId: number) => {
    setIsOpen(false);
    navigate(`/product/${productId}`);
  };

  return (
    <>
      {/* ===== CHATBOT BUTONU ===== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-[9999] group"
      >
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* ===== CHATBOT POPUP ===== */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl z-[9998] flex flex-col h-96 overflow-hidden border border-gray-200">
          
          {/* HEADER */}
          <div className="bg-cyan-500 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
              <div>
                <h3 className="font-bold text-lg">ALFA Asistan</h3>
                <p className="text-xs text-cyan-100">Çevrimiçi</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-cyan-600 p-1 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* MESAJLAR ALANI */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-cyan-100' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* ÜRÜN LINKI */}
                {msg.productLink && (
                  <div className="flex justify-start mt-2">
                    <button
                      onClick={() => handleProductClick(msg.productLink!.id)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
                    >
                      🔍 "{msg.productLink.name}" ürününü gör
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* YAZIYORUM GÖSTERGESI */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT ALANI */}
          <div className="flex gap-2 p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <input
              type="text"
              placeholder="Mesajınız yazın..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 disabled:bg-gray-100 transition"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-lg transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}