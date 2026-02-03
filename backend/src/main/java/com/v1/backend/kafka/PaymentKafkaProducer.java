package com.v1.backend.kafka;

import com.v1.backend.event.PaymentFailedEvent;
import com.v1.backend.event.PaymentSuccessEvent;
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
public class PaymentKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String PAYMENT_SUCCESS_TOPIC = "payment-success";
    public static final String PAYMENT_FAILED_TOPIC = "payment-failed";

    public void publishPaymentSuccess(PaymentSuccessEvent event) {
        log.info("Yayınlanıyor: PaymentSuccessEvent - OrderId: {}, OrderNumber: {}",
                event.getOrderId(), event.getOrderNumber());

        Message<PaymentSuccessEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, PAYMENT_SUCCESS_TOPIC)
                .setHeader(KafkaHeaders.KEY, event.getOrderNumber())
                .setHeader("event-id", UUID.randomUUID().toString())
                .setHeader("event-timestamp", System.currentTimeMillis())
                .build();

        try {
            kafkaTemplate.send(message)
                    .whenComplete((sendResult, ex) -> {
                        if (ex == null) {
                            log.info("PaymentSuccessEvent başarıyla yayınlandı - OrderId: {}", event.getOrderId());
                        } else {
                            log.error("PaymentSuccessEvent yayınlama başarısız - OrderId: {}", event.getOrderId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("PaymentSuccessEvent yayınlanırken hata oluştu", e);
            throw new RuntimeException("Kafka event yayınalamadı", e);
        }
    }

    public void publishPaymentFailed(PaymentFailedEvent event) {
        log.info("Yayınlanıyor: PaymentFailedEvent - OrderId: {}, OrderNumber: {}, Reason: {}",
                event.getOrderId(), event.getOrderNumber(), event.getReason());

        Message<PaymentFailedEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, PAYMENT_FAILED_TOPIC)
                .setHeader(KafkaHeaders.KEY, event.getOrderNumber())
                .setHeader("event-id", UUID.randomUUID().toString())
                .setHeader("event-timestamp", System.currentTimeMillis())
                .build();

        try {
            kafkaTemplate.send(message)
                    .whenComplete((sendResult, ex) -> {
                        if (ex == null) {
                            log.info("PaymentFailedEvent başarıyla yayınlandı - OrderId: {}", event.getOrderId());
                        } else {
                            log.error("PaymentFailedEvent yayınlama başarısız - OrderId: {}", event.getOrderId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("PaymentFailedEvent yayınlanırken hata oluştu", e);
            throw new RuntimeException("Kafka event yayınalamadı", e);
        }
    }
}