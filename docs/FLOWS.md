# SYSTEM FLOWS

## Order Creation Flow
- Order ilk olarak PAYMENT_CONFIRMED olarak açılır
- Gerçek ödeme yok (mock)
- Kafka ile zincir başlar

## Neden Saga?
- Distributed transaction yok
- Hata durumunda rollback yerine compensation

## Compensation Mantığı
- Payment fail → order CANCELLED
- Stock fail → refund + CANCELLED
