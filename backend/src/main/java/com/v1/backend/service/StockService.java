package com.v1.backend.service;

import com.v1.backend.event.PaymentSuccessEvent;
import com.v1.backend.event.StockReservationFailedEvent;
import com.v1.backend.event.StockReservedEvent;
import com.v1.backend.kafka.StockKafkaProducer;
import com.v1.backend.model.Order;
import com.v1.backend.model.OrderItem;
import com.v1.backend.model.Product;
import com.v1.backend.repository.OrderRepository;
import com.v1.backend.repository.ProductRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockKafkaProducer stockKafkaProducer;

    @KafkaListener(
            topics = "payment-success",
            groupId = "stock-service-group",
            concurrency = "3"
    )
    @Transactional
    @CircuitBreaker(
            name = "stockReservation",
            fallbackMethod = "stockReservationFallback"
    )
    @Retry(
            name = "stockReservation",
            fallbackMethod = "stockReservationFallback"
    )
    public void reserveStock(PaymentSuccessEvent event) {
        log.info("Stok rezervasyonu başlat - OrderId: {}, OrderNumber: {}",
                event.getOrderId(), event.getOrderNumber());

        try {
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + event.getOrderId()));

            if (!order.getStatus().equals(Order.OrderStatus.PAYMENT_CONFIRMED)) {
                log.warn("Sipariş durumu uygun değil - OrderId: {}, Status: {}",
                        event.getOrderId(), order.getStatus());
                return;
            }

            // Stok kontrolü ve rezervasyonu
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();

                if (!product.hasStock(item.getQuantity())) {
                    throw new IllegalArgumentException(
                            String.format("Yetersiz stok - ProductId: %d, Gerekli: %d, Mevcut: %d",
                                    product.getId(), item.getQuantity(), product.getStock())
                    );
                }

                // Stoğu düş
                product.decreaseStock(item.getQuantity());
                productRepository.save(product);

                log.info("Stok düşürüldü - ProductId: {}, Quantity: {}, YeniStok: {}",
                        product.getId(), item.getQuantity(), product.getStock());
            }

            // Order statüsünü güncelle
            order.markAsConfirmed();
            orderRepository.save(order);

            // StockReservedEvent yayınla
            List<StockReservedEvent.StockItem> stockItems = order.getItems().stream()
                    .map(item -> StockReservedEvent.StockItem.builder()
                            .productId(item.getProduct().getId())
                            .quantity(item.getQuantity())
                            .build())
                    .collect(Collectors.toList());

            StockReservedEvent stockReservedEvent = StockReservedEvent.builder()
                    .orderId(event.getOrderId())
                    .orderNumber(event.getOrderNumber())
                    .userId(event.getUserId())
                    .items(stockItems)
                    .reservedAt(LocalDateTime.now())
                    .build();

            stockKafkaProducer.publishStockReserved(stockReservedEvent);

            log.info("Stok başarıyla rezerve edildi - OrderId: {}, OrderNumber: {}",
                    event.getOrderId(), event.getOrderNumber());

        } catch (IllegalArgumentException e) {
            log.error("Stok rezervasyonu başarısız - OrderId: {}, Hata: {}",
                    event.getOrderId(), e.getMessage(), e);

            try {
                Order order = orderRepository.findById(event.getOrderId()).orElse(null);
                if (order != null) {
                    order.setStatus(Order.OrderStatus.STOCK_RESERVATION_FAILED);
                    orderRepository.save(order);
                }
            } catch (Exception saveEx) {
                log.error("Order güncelleme başarısız - OrderId: {}", event.getOrderId(), saveEx);
            }

            StockReservationFailedEvent failedEvent = StockReservationFailedEvent.builder()
                    .orderId(event.getOrderId())
                    .orderNumber(event.getOrderNumber())
                    .userId(event.getUserId())
                    .reason(e.getMessage())
                    .failedAt(LocalDateTime.now())
                    .build();

            stockKafkaProducer.publishStockReservationFailed(failedEvent);

            throw e;

        } catch (Exception e) {
            log.error("Stok rezervasyonunda beklenmeyen hata - OrderId: {}, Hata: {}",
                    event.getOrderId(), e.getMessage(), e);

            try {
                Order order = orderRepository.findById(event.getOrderId()).orElse(null);
                if (order != null) {
                    order.setStatus(Order.OrderStatus.STOCK_RESERVATION_FAILED);
                    orderRepository.save(order);
                }
            } catch (Exception saveEx) {
                log.error("Order güncelleme başarısız - OrderId: {}", event.getOrderId(), saveEx);
            }

            StockReservationFailedEvent failedEvent = StockReservationFailedEvent.builder()
                    .orderId(event.getOrderId())
                    .orderNumber(event.getOrderNumber())
                    .userId(event.getUserId())
                    .reason(e.getMessage())
                    .failedAt(LocalDateTime.now())
                    .build();

            stockKafkaProducer.publishStockReservationFailed(failedEvent);

            throw new RuntimeException("Stok rezervasyonu başarısız", e);
        }
    }

    public void stockReservationFallback(PaymentSuccessEvent event, Exception ex) {
        log.error("FALLBACK: Stok rezervasyonu başarısız - OrderId: {}, Hata: {}",
                event.getOrderId(), ex.getMessage(), ex);

        try {
            Order order = orderRepository.findById(event.getOrderId()).orElse(null);
            if (order != null) {
                order.setStatus(Order.OrderStatus.STOCK_RESERVATION_FAILED);
                orderRepository.save(order);
            }

            StockReservationFailedEvent failedEvent = StockReservationFailedEvent.builder()
                    .orderId(event.getOrderId())
                    .orderNumber(event.getOrderNumber())
                    .userId(event.getUserId())
                    .reason("Sistem hatası: " + ex.getMessage())
                    .failedAt(LocalDateTime.now())
                    .build();

            stockKafkaProducer.publishStockReservationFailed(failedEvent);

        } catch (Exception e) {
            log.error("Fallback da hata - OrderId: {}", event.getOrderId(), e);
        }
    }
}