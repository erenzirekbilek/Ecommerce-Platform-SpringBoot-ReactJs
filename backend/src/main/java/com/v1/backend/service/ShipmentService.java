package com.v1.backend.service;

import com.v1.backend.event.StockReservedEvent;
import com.v1.backend.model.Order;
import com.v1.backend.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final OrderRepository orderRepository;

    @KafkaListener(
            topics = "stock-reserved",
            groupId = "shipment-service-group",
            concurrency = "3"
    )
    @Transactional
    @CircuitBreaker(
            name = "shipmentPreparation",
            fallbackMethod = "shipmentPreparationFallback"
    )
    @Retry(
            name = "shipmentPreparation",
            fallbackMethod = "shipmentPreparationFallback"
    )
    public void prepareShipment(StockReservedEvent event) {
        log.info("Kargo hazırlığı başlat - OrderId: {}, OrderNumber: {}",
                event.getOrderId(), event.getOrderNumber());

        try {
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + event.getOrderId()));

            if (!order.getStatus().equals(Order.OrderStatus.STOCK_RESERVED)) {
                log.warn("Sipariş durumu uygun değil - OrderId: {}, Status: {}",
                        event.getOrderId(), order.getStatus());
                return;
            }

            // Siparişi gönderime hazır olarak işaretle
            order.markAsReadyForShipment();
            orderRepository.save(order);

            log.info("Sipariş gönderime hazır - OrderId: {}, OrderNumber: {}",
                    event.getOrderId(), event.getOrderNumber());

        } catch (Exception e) {
            log.error("Kargo hazırlığında hata - OrderId: {}, Hata: {}",
                    event.getOrderId(), e.getMessage(), e);
            throw new RuntimeException("Kargo hazırlığı başarısız", e);
        }
    }

    public void shipmentPreparationFallback(StockReservedEvent event, Exception ex) {
        log.error("FALLBACK: Kargo hazırlığı başarısız - OrderId: {}, Hata: {}",
                event.getOrderId(), ex.getMessage(), ex);
    }
}