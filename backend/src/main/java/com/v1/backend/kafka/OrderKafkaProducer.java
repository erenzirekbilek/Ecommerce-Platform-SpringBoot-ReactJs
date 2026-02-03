package com.v1.backend.kafka;

import com.v1.backend.event.OrderCreatedEvent;
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
public class OrderKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String ORDER_CREATED_TOPIC = "order-created";

    public void publishOrderCreated(OrderCreatedEvent event) {
        log.info("Yayınlanıyor: OrderCreatedEvent - OrderId: {}, OrderNumber: {}",
                event.getOrderId(), event.getOrderNumber());

        Message<OrderCreatedEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, ORDER_CREATED_TOPIC)
                .setHeader(KafkaHeaders.KEY, event.getOrderNumber())
                .setHeader("event-id", UUID.randomUUID().toString())
                .setHeader("event-timestamp", System.currentTimeMillis())
                .build();

        try {
            kafkaTemplate.send(message)
                    .whenComplete((sendResult, ex) -> {
                        if (ex == null) {
                            log.info("OrderCreatedEvent başarıyla yayınlandı - OrderId: {}", event.getOrderId());
                        } else {
                            log.error("OrderCreatedEvent yayınlama başarısız - OrderId: {}", event.getOrderId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("OrderCreatedEvent yayınlanırken hata oluştu", e);
            throw new RuntimeException("Kafka event yayınalamadı", e);
        }
    }
}