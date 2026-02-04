# TechHub - Scalable E-Commerce Ecosystem

TechHub, yüksek trafikli senaryolar düşünülerek tasarlanmış; Java Spring Boot (Backend) ve React/TypeScript (Frontend) mimarisi üzerine kurulu modern bir e-ticaret platformudur. Performans optimizasyonu için **Redis**, veri bütünlüğü için **PostgreSQL** ve Kafka, Redis, Zookeeper, Prometheus ve Grafana gibi altyapı bileşenlerinin izole, tutarlı ve kolay yönetilebilir şekilde çalıştırılması ve entegrasyonunun sağlanması amacıyla **Docker** kullanır.API dokümantasyonu ve test edilebilirlik için **Swagger (OpenAPI)** kullanılır
asenkron ve event-driven mimari için **Apache Kafka**, sistem metriklerinin toplanması için Prometheus, görselleştirilmesi için **Grafana** entegre edilmiştir.

---

## Teknolojik Donanım (Tech Stack)

### Backend (Microservice-Ready Monolith)

- Java 17 & Spring Boot: Güçlü tip güvenliği ve Spring Security
- PostgreSQL: Kompleks ilişkisel veriler
- Redis Caching: Ürün ve sepet işlemleri
- Kafka Event Bus: OrderCreatedEvent cascade flow
- Hibernate & JPA: ORM kolaylığı
- Resilience4j: Circuit Breaker, Retry, RateLimiter
- iText PDF: Fatura generation
- Docker & Docker Compose: Portable ortam

### Frontend (Modern UI/UX)

- React & TypeScript: Hatasız kodlama
- Redux Toolkit: State Management
- Tailwind CSS: Modern styling
- Axios: Merkezi API yönetimi

---

## Sistem Mimarisi - Saga Pattern

Sipariş oluşturuldığında şu cascade flow gerçekleşir:

```
User Checkout
    ↓
Order Created (PAYMENT_CONFIRMED) ← Mock Ödeme
    ↓ [OrderCreatedEvent]
Payment Service ← PAID
    ↓ [PaymentSuccessEvent]
Stock Service ← STOCK_RESERVED
    ↓ [StockReservedEvent]
Shipment Service ← READY_FOR_SHIPMENT
    ↓
Admin Tarafı (SHIPPED, DELIVERED)
```

Hata durumunda CompensationService refund işlemi başlatır.

---

## Order Status Flow

| Status | Açıklama |
|--------|----------|
| AWAITING_PAYMENT | Siparış bekleniyor |
| PAYMENT_CONFIRMED | Ödeme onaylandı |
| STOCK_RESERVED | Stok ayrıldı |
| READY_FOR_SHIPMENT | Gönderime hazır |
| SHIPPED | Kargoya verildi |
| DELIVERED | Teslim edildi |
| CANCELLED | İptal edildi |

---

## Hızlı Başlangıç

### 1. Gereksinimler

- JDK 17+
- Node.js (v16+)
- Docker Desktop

### 2. Docker ile Altyapı Hazırlama

```bash
docker-compose up -d
```

Services:
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Kafka: localhost:9092

### 3. Backend Çalıştırma

```bash
cd backend
./mvnw spring-boot:run
```

API: http://localhost:8082

### 4. Frontend Çalıştırma

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

---

## API Endpoints

```
POST   /api/v1/auth/register              - Kayıt ol
POST   /api/v1/auth/login                 - Giriş yap
GET    /api/v1/products                   - Ürünleri listele
POST   /api/v1/orders                     - Sipariş oluştur (Saga başlatır)
GET    /api/v1/orders/{orderId}           - Sipariş detayı
GET    /api/v1/orders/{orderId}/invoice   - Fatura PDF indir
GET    /api/v1/orders                     - Kullanıcı siparişleri
PATCH  /api/v1/orders/{orderId}/ship      - Kargo gönder (Admin)
PATCH  /api/v1/orders/{orderId}/deliver   - Teslim et (Admin)
```

---

## Proje Klasör Yapısı

```
TechHub/
├── backend/
│   ├── src/main/java/
│   │   ├── controller/       - REST Controllers
│   │   ├── service/          - OrderService, PaymentService
│   │   ├── model/            - Order, Product entities
│   │   ├── repository/       - JPA Repositories
│   │   ├── event/            - Kafka Events
│   │   ├── kafka/            - Kafka Producers/Consumers
│   │   └── util/             - InvoicePdfGenerator
│   └── resources/
│       └── application.yml   - Spring Config
│
├── frontend/
│   └── src/
│       ├── components/       - UI Components
│       ├── pages/            - Route Pages
│       ├── features/         - Auth, Cart, Order
│       ├── hooks/            - useOrder, useCart
│       └── services/         - orderApi.ts
│
├── docker-compose.yml
└── README.md
```

---

## Sipariş İş Akışı (Order Flow)

1. User → CheckoutPage (adres, telefon, ödeme yöntemi)
2. Backend → Order oluştur (AWAITING_PAYMENT)
3. Mock Payment → PAID (otomatik)
4. Status → PAYMENT_CONFIRMED
5. Kafka Event → OrderCreatedEvent yayınla
6. Frontend → /order-confirmation/{orderId}
7. OrderConfirmationPage:
   - Teslimat numarası (kopyala butonu)
   - Fatura PDF indirme butonu
   - Real-time timeline (6 stage progress)

---

## Fatura (Invoice) PDF İndirme

```
GET /api/v1/orders/{orderId}/invoice
Response: PDF file
Filename: ORD-xxxxx-Fatura.pdf
```

PDF İçeriği:
- Header: TechHub Logo
- Fatura No ve Tarihi
- Müşteri Bilgileri
- Ürün Listesi
- Totals (Ara Toplam, Kargo, Vergi, Toplam)
- Footer: Otomatik oluşturulmuş belge

---

## Kafka Event Topics

```
order-created                - OrderService → PaymentService
payment-success             - PaymentService → StockService
payment-failed              - PaymentService → Compensation
stock-reserved              - StockService → ShipmentService
stock-reservation-failed    - StockService → Compensation
order-cancelled             - Compensation → OrderService
```

---

## Güvenlik (Security)

- JWT Token: Stateless authentication
- BCrypt: Şifre encryption
- Authorization: Role-based access (USER, ADMIN)
- Protected Endpoints: /orders, /cart (JWT gerekli)
- Public Endpoints: /products, /categories

---

## Troubleshooting

### Docker Error
```bash
docker-compose logs postgres
docker-compose restart
```

### JWT Expired
Login yaparak yeni token al

### Kafka Consumer Lag
```bash
docker exec techhub-kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --group order-service --describe
```

---

## Gelecek Roadmap

- [ ] Elasticsearch: Ultra hızlı ürün araması
- [ ] RabbitMQ: E-posta bildirimleri
- [ ] Stripe/Iyzico: Gerçek ödeme gateway
- [ ] WebSocket: Real-time tracking
- [ ] Kubernetes: Orkestrasyon

---

## İletişim

Email: erenzirekbilek@hotmail.com