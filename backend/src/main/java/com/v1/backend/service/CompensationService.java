package com.v1.backend.service;

import com.v1.backend.event.PaymentFailedEvent;
import com.v1.backend.event.StockReservationFailedEvent;
import com.v1.backend.model.Order;
import com.v1.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompensationService {

    private final OrderRepository orderRepository;

    @KafkaListener(
            topics = "payment-failed",
            groupId = "compensation-service-group",
            concurrency = "3"
    )
    @Transactional
    public void handlePaymentFailed(PaymentFailedEvent event) {
        log.info("Ödeme başarısız telafisi - OrderId: {}, OrderNumber: {}, Reason: {}",
                event.getOrderId(), event.getOrderNumber(), event.getReason());

        try {
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + event.getOrderId()));

            order.setStatus(Order.OrderStatus.PAYMENT_FAILED);
            order.cancel("Ödeme başarısız: " + event.getReason());
            orderRepository.save(order);

            log.info("Sipariş iptal edildi - OrderId: {}, Reason: Ödeme başarısız",
                    event.getOrderId());

        } catch (Exception e) {
            log.error("Ödeme başarısız telafisinde hata - OrderId: {}, Hata: {}",
                    event.getOrderId(), e.getMessage(), e);
        }
    }

    @KafkaListener(
            topics = "stock-reservation-failed",
            groupId = "compensation-service-group",
            concurrency = "3"
    )
    @Transactional
    public void handleStockReservationFailed(StockReservationFailedEvent event) {
        log.info("Stok rezervasyonu başarısız telafisi - OrderId: {}, OrderNumber: {}, Reason: {}",
                event.getOrderId(), event.getOrderNumber(), event.getReason());

        try {
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + event.getOrderId()));

            // Ödeme iadesi işlemi burada yapılır (örneğin, RefundService çağrısı)
            // refundService.refundPayment(event.getOrderId(), order.getTotalPrice());

            order.setStatus(Order.OrderStatus.STOCK_RESERVATION_FAILED);
            order.cancel("Stok rezervasyonu başarısız: " + event.getReason());
            orderRepository.save(order);

            log.info("Sipariş iptal edildi - OrderId: {}, Reason: Stok yok",
                    event.getOrderId());

        } catch (Exception e) {
            log.error("Stok rezervasyonu başarısız telafisinde hata - OrderId: {}, Hata: {}",
                    event.getOrderId(), e.getMessage(), e);
        }
    }
}