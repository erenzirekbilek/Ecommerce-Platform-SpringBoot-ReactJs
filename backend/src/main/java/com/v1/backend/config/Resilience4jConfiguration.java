package com.v1.backend.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.core.registry.EntryAddedEvent;
import io.github.resilience4j.core.registry.EntryRemovedEvent;
import io.github.resilience4j.core.registry.EntryReplacedEvent;
import io.github.resilience4j.core.registry.RegistryEventConsumer;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Slf4j
@Configuration
public class Resilience4jConfiguration {

    @Bean
    public CircuitBreaker orderCreationCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .permittedNumberOfCallsInHalfOpenState(3)
                .slowCallDurationThreshold(Duration.ofSeconds(2))
                .slowCallRateThreshold(50)
                .recordExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();

        CircuitBreaker circuitBreaker = registry.circuitBreaker("orderCreation", config);
        circuitBreaker.getEventPublisher()
                .onStateTransition(event -> log.warn("OrderCreation CircuitBreaker state değişti: {} -> {}",
                        event.getStateTransition().getFromState(),
                        event.getStateTransition().getToState()))
                .onError(event -> log.error("OrderCreation CircuitBreaker Error: {}", event.getThrowable().getMessage()))
                .onSuccess(event -> log.info("OrderCreation CircuitBreaker başarılı işlem"));

        return circuitBreaker;
    }

    @Bean
    public CircuitBreaker paymentProcessingCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(60)
                .waitDurationInOpenState(Duration.ofSeconds(15))
                .permittedNumberOfCallsInHalfOpenState(5)
                .slowCallDurationThreshold(Duration.ofSeconds(1))
                .slowCallRateThreshold(70)
                .recordExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();

        CircuitBreaker circuitBreaker = registry.circuitBreaker("paymentProcessing", config);
        circuitBreaker.getEventPublisher()
                .onStateTransition(event -> log.warn("PaymentProcessing CircuitBreaker state değişti: {} -> {}",
                        event.getStateTransition().getFromState(),
                        event.getStateTransition().getToState()))
                .onError(event -> log.error("PaymentProcessing CircuitBreaker Error: {}", event.getThrowable().getMessage()));

        return circuitBreaker;
    }

    @Bean
    public CircuitBreaker stockReservationCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(60)
                .waitDurationInOpenState(Duration.ofSeconds(15))
                .permittedNumberOfCallsInHalfOpenState(5)
                .slowCallDurationThreshold(Duration.ofSeconds(1))
                .slowCallRateThreshold(70)
                .recordExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();

        CircuitBreaker circuitBreaker = registry.circuitBreaker("stockReservation", config);
        circuitBreaker.getEventPublisher()
                .onStateTransition(event -> log.warn("StockReservation CircuitBreaker state değişti: {} -> {}",
                        event.getStateTransition().getFromState(),
                        event.getStateTransition().getToState()))
                .onError(event -> log.error("StockReservation CircuitBreaker Error: {}", event.getThrowable().getMessage()));

        return circuitBreaker;
    }

    @Bean
    public CircuitBreaker shipmentPreparationCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .permittedNumberOfCallsInHalfOpenState(3)
                .slowCallDurationThreshold(Duration.ofSeconds(2))
                .slowCallRateThreshold(50)
                .recordExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();

        CircuitBreaker circuitBreaker = registry.circuitBreaker("shipmentPreparation", config);
        circuitBreaker.getEventPublisher()
                .onStateTransition(event -> log.warn("ShipmentPreparation CircuitBreaker state değişti: {} -> {}",
                        event.getStateTransition().getFromState(),
                        event.getStateTransition().getToState()))
                .onError(event -> log.error("ShipmentPreparation CircuitBreaker Error: {}", event.getThrowable().getMessage()));

        return circuitBreaker;
    }

    @Bean
    public Retry orderCreationRetry(RetryRegistry registry) {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofMillis(500))
                .intervalFunction(io.github.resilience4j.core.IntervalFunction
                        .ofExponentialRandomBackoff(500, 2))
                .retryExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();

        Retry retry = registry.retry("orderCreation", config);
        retry.getEventPublisher()
                .onRetry(event -> log.warn("OrderCreation Retry attempt: {}, Reason: {}",
                        event.getNumberOfRetryAttempts(),
                        event.getLastThrowable().getMessage()))
                .onSuccess(event -> log.info("OrderCreation Retry başarılı, Attempts: {}",
                        event.getNumberOfRetryAttempts()));

        return retry;
    }

    @Bean
    public Retry paymentProcessingRetry(RetryRegistry registry) {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(5)
                .waitDuration(Duration.ofMillis(300))
                .intervalFunction(io.github.resilience4j.core.IntervalFunction
                        .ofExponentialRandomBackoff(300, 1.5))
                .retryExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();

        Retry retry = registry.retry("paymentProcessing", config);
        retry.getEventPublisher()
                .onRetry(event -> log.warn("PaymentProcessing Retry attempt: {}, Reason: {}",
                        event.getNumberOfRetryAttempts(),
                        event.getLastThrowable().getMessage()));

        return retry;
    }

    @Bean
    public Retry stockReservationRetry(RetryRegistry registry) {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(5)
                .waitDuration(Duration.ofMillis(300))
                .intervalFunction(io.github.resilience4j.core.IntervalFunction
                        .ofExponentialRandomBackoff(300, 1.5))
                .retryExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();

        Retry retry = registry.retry("stockReservation", config);
        retry.getEventPublisher()
                .onRetry(event -> log.warn("StockReservation Retry attempt: {}, Reason: {}",
                        event.getNumberOfRetryAttempts(),
                        event.getLastThrowable().getMessage()));

        return retry;
    }

    @Bean
    public Retry shipmentPreparationRetry(RetryRegistry registry) {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofMillis(500))
                .intervalFunction(io.github.resilience4j.core.IntervalFunction
                        .ofExponentialRandomBackoff(500, 2))
                .retryExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();

        Retry retry = registry.retry("shipmentPreparation", config);
        retry.getEventPublisher()
                .onRetry(event -> log.warn("ShipmentPreparation Retry attempt: {}, Reason: {}",
                        event.getNumberOfRetryAttempts(),
                        event.getLastThrowable().getMessage()));

        return retry;
    }

    @Bean
    public RegistryEventConsumer<CircuitBreaker> circuitBreakerEventConsumer() {
        return new RegistryEventConsumer<CircuitBreaker>() {
            @Override
            public void onEntryAddedEvent(EntryAddedEvent<CircuitBreaker> entryAddedEvent) {
                log.info("CircuitBreaker eklendi: {}", entryAddedEvent.getAddedEntry().getName());
            }

            @Override
            public void onEntryRemovedEvent(EntryRemovedEvent<CircuitBreaker> event) {
                log.info("CircuitBreaker kaldırıldı: {}", event.getRemovedEntry().getName());
            }

            @Override
            public void onEntryReplacedEvent(EntryReplacedEvent<CircuitBreaker> event) {
                log.info("CircuitBreaker değiştirildi: {}", event.getNewEntry().getName());
            }
        };
    }

    @Bean
    public RegistryEventConsumer<Retry> retryEventConsumer() {
        return new RegistryEventConsumer<Retry>() {
            @Override
            public void onEntryAddedEvent(EntryAddedEvent<Retry> entryAddedEvent) {
                log.info("Retry oluşturuldu: {}", entryAddedEvent.getAddedEntry().getName());
            }

            @Override
            public void onEntryRemovedEvent(EntryRemovedEvent<Retry> entryRemovedEvent) {
                log.info("Retry kaldırıldı: {}", entryRemovedEvent.getRemovedEntry().getName());
            }

            @Override
            public void onEntryReplacedEvent(EntryReplacedEvent<Retry> entryReplacedEvent) {
                log.info("Retry değiştirildi: {}", entryReplacedEvent.getNewEntry().getName());
            }
        };
    }
}