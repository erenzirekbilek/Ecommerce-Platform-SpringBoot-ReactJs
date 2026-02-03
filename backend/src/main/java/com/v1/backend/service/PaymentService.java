package com.v1.backend.service;

import com.v1.backend.event.OrderCreatedEvent;
import com.v1.backend.event.PaymentFailedEvent;
import com.v1.backend.event.PaymentSuccessEvent;
import com.v1.backend.kafka.PaymentKafkaProducer;
import com.v1.backend.model.Order;
import com.v1.backend.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentKafkaProducer paymentKafkaProducer;

    @KafkaListener(
            topics = "order-created",
            groupId = "payment-service-group",
            concurrency = "3"
    )
    @Transactional
    @CircuitBreaker(
            name = "paymentProcessing",
            fallbackMethod = "paymentProcessingFallback"
    )
    @Retry(
            name = "paymentProcessing",
            fallbackMethod = "paymentProcessingFallback"
    )
    public void processPayment(OrderCreatedEvent event) {
        log.info("Ödeme işlemini başlat - OrderId: {}, OrderNumber: {}, TotalPrice: {}",
                event.getOrderId(), event.getOrderNumber(), event.getTotalPrice());

        try {
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + event.getOrderId()));

            if (!order.getPaymentStatus().equals(Order.PaymentStatus.PENDING)) {
                log.warn("Sipariş zaten işlenmiş - OrderId: {}, PaymentStatus: {}",
                        event.getOrderId(), order.getPaymentStatus());
                return;
            }

            boolean paymentSuccess = processPaymentWithProvider(event);

            if (paymentSuccess) {
                order.markAsPaid();
                orderRepository.save(order);

                PaymentSuccessEvent successEvent = PaymentSuccessEvent.builder()
                        .orderId(event.getOrderId())
                        .orderNumber(event.getOrderNumber())
                        .userId(event.getUserId())
                        .totalPrice(event.getTotalPrice())
                        .paymentMethod(order.getPaymentMethod())
                        .paidAt(LocalDateTime.now())
                        .build();

                paymentKafkaProducer.publishPaymentSuccess(successEvent);

                log.info("Ödeme başarılı - OrderId: {}, OrderNumber: {}",
                        event.getOrderId(), event.getOrderNumber());

            } else {
                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                order.setStatus(Order.OrderStatus.PAYMENT_FAILED);
                orderRepository.save(order);

                PaymentFailedEvent failedEvent = PaymentFailedEvent.builder()
                        .orderId(event.getOrderId())
                        .orderNumber(event.getOrderNumber())
                        .userId(event.getUserId())
                        .reason("Ödeme sağlayıcısından reddedildi")
                        .failedAt(LocalDateTime.now())
                        .build();

                paymentKafkaProducer.publishPaymentFailed(failedEvent);

                log.warn("Ödeme başarısız - OrderId: {}, OrderNumber: {}",
                        event.getOrderId(), event.getOrderNumber());
            }

        } catch (Exception e) {
            log.error("Ödeme işleminde hata - OrderId: {}, Hata: {}",
                    event.getOrderId(), e.getMessage(), e);

            try {
                Order order = orderRepository.findById(event.getOrderId()).orElse(null);
                if (order != null) {
                    order.setPaymentStatus(Order.PaymentStatus.FAILED);
                    order.setStatus(Order.OrderStatus.PAYMENT_FAILED);
                    orderRepository.save(order);
                }
            } catch (Exception saveEx) {
                log.error("Order güncelleme başarısız - OrderId: {}", event.getOrderId(), saveEx);
            }

            PaymentFailedEvent failedEvent = PaymentFailedEvent.builder()
                    .orderId(event.getOrderId())
                    .orderNumber(event.getOrderNumber())
                    .userId(event.getUserId())
                    .reason(e.getMessage())
                    .failedAt(LocalDateTime.now())
                    .build();

            paymentKafkaProducer.publishPaymentFailed(failedEvent);

            throw new RuntimeException("Ödeme işlemi başarısız", e);
        }
    }

    public void paymentProcessingFallback(OrderCreatedEvent event, Exception ex) {
        log.error("FALLBACK: Ödeme işlemi başarısız - OrderId: {}, Hata: {}",
                event.getOrderId(), ex.getMessage(), ex);

        try {
            Order order = orderRepository.findById(event.getOrderId()).orElse(null);
            if (order != null) {
                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                order.setStatus(Order.OrderStatus.PAYMENT_FAILED);
                orderRepository.save(order);
            }

            PaymentFailedEvent failedEvent = PaymentFailedEvent.builder()
                    .orderId(event.getOrderId())
                    .orderNumber(event.getOrderNumber())
                    .userId(event.getUserId())
                    .reason("Sistem hatası: " + ex.getMessage())
                    .failedAt(LocalDateTime.now())
                    .build();

            paymentKafkaProducer.publishPaymentFailed(failedEvent);

        } catch (Exception e) {
            log.error("Fallback da hata - OrderId: {}", event.getOrderId(), e);
        }
    }

    private boolean processPaymentWithProvider(OrderCreatedEvent event) {
        // Burada gerçek ödeme sağlayıcısı API'si çağrılır
        // Şimdilik sabit true döndürüyoruz (başarılı ödeme)
        // Gerçekte: Stripe, PayPal, vb. ile entegrasyon olacak

        log.info("Ödeme sağlayıcısına istek gönderiliyor - OrderNumber: {}, Amount: {}",
                event.getOrderNumber(), event.getTotalPrice());

        // Mock implementation - %5 başarısız olma ihtimali
        boolean success = Math.random() > 0.05;

        if (success) {
            log.info("Ödeme sağlayıcısı onayladı - OrderNumber: {}", event.getOrderNumber());
        } else {
            log.warn("Ödeme sağlayıcısı reddetti - OrderNumber: {}", event.getOrderNumber());
        }

        return success;
    }
}