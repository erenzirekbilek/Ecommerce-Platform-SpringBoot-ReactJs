# TECH DECISIONS

## Neden Microservice değil?
- Tek geliştirici
- Deployment ve observability maliyeti

## Neden Redis Cart?
- DB hit azaltma
- Session bağımsız sepet

## Neden Kafka?
- Order zinciri async
- Loose coupling
