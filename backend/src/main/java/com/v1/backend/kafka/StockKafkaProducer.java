package com.v1.backend.kafka;

import com.v1.backend.event.StockReservationFailedEvent;
import com.v1.backend.event.StockReservedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String STOCK_RESERVED_TOPIC = "stock-reserved";
    public static final String STOCK_RESERVATION_FAILED_TOPIC = "stock-reservation-failed";

    public void publishStockReserved(StockReservedEvent event) {
        log.info("Yayınlanıyor: StockReservedEvent - OrderId: {}, OrderNumber: {}",
                event.getOrderId(), event.getOrderNumber());

        Message<StockReservedEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, STOCK_RESERVED_TOPIC)
                .setHeader(KafkaHeaders.KEY, event.getOrderNumber())
                .setHeader("event-id", UUID.randomUUID().toString())
                .setHeader("event-timestamp", System.currentTimeMillis())
                .build();

        try {
            kafkaTemplate.send(message)
                    .whenComplete((sendResult, ex) -> {
                        if (ex == null) {
                            log.info("StockReservedEvent başarıyla yayınlandı - OrderId: {}", event.getOrderId());
                        } else {
                            log.error("StockReservedEvent yayınlama başarısız - OrderId: {}", event.getOrderId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("StockReservedEvent yayınlanırken hata oluştu", e);
            throw new RuntimeException("Kafka event yayınalamadı", e);
        }
    }

    public void publishStockReservationFailed(StockReservationFailedEvent event) {
        log.info("Yayınlanıyor: StockReservationFailedEvent - OrderId: {}, OrderNumber: {}, Reason: {}",
                event.getOrderId(), event.getOrderNumber(), event.getReason());

        Message<StockReservationFailedEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, STOCK_RESERVATION_FAILED_TOPIC)
                .setHeader(KafkaHeaders.KEY, event.getOrderNumber())
                .setHeader("event-id", UUID.randomUUID().toString())
                .setHeader("event-timestamp", System.currentTimeMillis())
                .build();

        try {
            kafkaTemplate.send(message)
                    .whenComplete((sendResult, ex) -> {
                        if (ex == null) {
                            log.info("StockReservationFailedEvent başarıyla yayınlandı - OrderId: {}", event.getOrderId());
                        } else {
                            log.error("StockReservationFailedEvent yayınlama başarısız - OrderId: {}", event.getOrderId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("StockReservationFailedEvent yayınlanırken hata oluştu", e);
            throw new RuntimeException("Kafka event yayınalamadı", e);
        }
    }
}