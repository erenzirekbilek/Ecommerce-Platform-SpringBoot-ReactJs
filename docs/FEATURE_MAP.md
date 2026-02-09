# FEATURE MAP

## 🔐 Authentication
- Controller: AuthController
- Service: AuthService
- Security: JwtFilter, JwtProvider
- DTO: LoginRequest, SignupRequest
- DB: User (model)

## 🛒 Cart
- Controller: CartController
- Service: CartService
- Cache: Redis (userId bazlı)
- DTO: AddToCartRequest, CartResponse

## 📦 Order (Saga Core)
- Controller: OrderController
- Service: OrderService
- Events:
  - OrderCreatedEvent
  - OrderCancelledEvent
- Kafka Topics:
  - order-created
  - order-cancelled
- Status Logic: OrderStatus enum

## 💳 Payment (Mock)
- Listener: PaymentEventListener
- Event Out:
  - PaymentSuccessEvent
  - PaymentFailedEvent

## 📦 Stock
- Listener: StockEventListener
- Compensation: StockReservationFailedEvent

## 🚚 Shipment
- Service: ShipmentService
- Admin Flow: ship(), deliver()

## 🧾 Invoice
- Service: InvoiceService
- Library: iText
- Endpoint: GET /orders/{id}/invoice
