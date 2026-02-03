package com.v1.backend.kafka;

import com.v1.backend.event.StockDecrementEvent;
import com.v1.backend.model.Product;
import com.v1.backend.repository.ProductRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockDecrementConsumer {

    private final ProductRepository productRepository;

    /**
     * Stok düşümü event'ini consume eder
     * Resilience4J CircuitBreaker ve Retry pattern'ları ile korunur
     */
    @KafkaListener(
            topics = "stock-decrement",
            groupId = "stock-decrement-group",
            concurrency = "3"
    )
    @CircuitBreaker(
            name = "stockDecrement",
            fallbackMethod = "stockDecrementFallback"
    )
    @Retry(
            name = "stockDecrement",
            fallbackMethod = "stockDecrementFallback"
    )
    public void handleStockDecrement(StockDecrementEvent event) {
        log.info("StockDecrementEvent alındı - ProductId: {}, Quantity: {}, OrderId: {}",
                event.getProductId(), event.getQuantity(), event.getOrderId());

        try {
            Optional<Product> productOpt = productRepository.findById(event.getProductId());

            if (productOpt.isEmpty()) {
                log.error("Ürün bulunamadı - ProductId: {}, OrderId: {}",
                        event.getProductId(), event.getOrderId());
                throw new IllegalArgumentException("Ürün bulunamadı: " + event.getProductId());
            }

            Product product = productOpt.get();

            if (!product.hasStock(event.getQuantity())) {
                log.error("Yetersiz stok - ProductId: {}, MevcutStok: {}, İstenenMiktar: {}, OrderId: {}",
                        event.getProductId(), product.getStock(), event.getQuantity(), event.getOrderId());
                throw new IllegalArgumentException(
                        String.format("Yetersiz stok - ProductId: %d, MevcutStok: %d, İstenenMiktar: %d",
                                event.getProductId(), product.getStock(), event.getQuantity())
                );
            }

            product.decreaseStock(event.getQuantity());
            productRepository.save(product);

            log.info("Stok başarıyla düşürüldü - ProductId: {}, YeniStok: {}, OrderId: {}",
                    event.getProductId(), product.getStock(), event.getOrderId());

        } catch (IllegalArgumentException e) {
            log.error("Stok düşürme işleminde hata - OrderId: {} - Hata: {}",
                    event.getOrderId(), e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Beklenmeyen hata oluştu - OrderId: {}",
                    event.getOrderId(), e);
            throw new RuntimeException("Stok düşürme işleminde beklenmeyen hata", e);
        }
    }

    /**
     * Fallback method - CircuitBreaker açık olduğunda veya maksimum retry'dan sonra çağrılır
     */
    public void stockDecrementFallback(StockDecrementEvent event, Exception ex) {
        log.error("FALLBACK: Stok düşürme başarısız oldu - ProductId: {}, OrderId: {}, Hata: {}",
                event.getProductId(), event.getOrderId(), ex.getMessage(), ex);

        // Burada dead letter queue'ye gönderebilir veya notification gönderebilirsiniz
        // Örneğin: notificationService.sendStockDecrementFailureAlert(event);
    }
}