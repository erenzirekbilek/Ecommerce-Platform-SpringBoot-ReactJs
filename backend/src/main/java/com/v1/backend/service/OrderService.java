package com.v1.backend.service;

import com.v1.backend.dto.order.CreateOrderRequest;
import com.v1.backend.dto.order.OrderResponse;
import com.v1.backend.event.OrderCreatedEvent;
import com.v1.backend.kafka.OrderKafkaProducer;
import com.v1.backend.model.Order;
import com.v1.backend.model.OrderItem;
import com.v1.backend.model.Product;
import com.v1.backend.model.User;
import com.v1.backend.repository.OrderRepository;
import com.v1.backend.repository.ProductRepository;
import com.v1.backend.repository.UserRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderKafkaProducer kafkaProducer;
    private final CartService cartService;

    @Transactional
    @CircuitBreaker(
            name = "orderCreation",
            fallbackMethod = "createOrderFallback"
    )
    @Retry(
            name = "orderCreation",
            fallbackMethod = "createOrderFallback"
    )
    public OrderResponse createOrder(CreateOrderRequest request, Long userId) {
        log.info("Sipariş oluşturuluyor - UserId: {}, İtemSayısı: {}", userId, request.getItems().size());

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı: " + userId));

            Order order = Order.builder()
                    .orderNumber(generateOrderNumber())
                    .user(user)
                    .shippingAddress(request.getShippingAddress())
                    .billingAddress(request.getBillingAddress() != null ?
                            request.getBillingAddress() : request.getShippingAddress())
                    .phoneNumber(request.getPhoneNumber())
                    .paymentMethod(request.getPaymentMethod())
                    .shippingCost(request.getShippingCost())
                    .taxAmount(request.getTaxAmount())
                    .build();

            for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı: " + itemRequest.getProductId()));

                if (!product.isAvailable() || !product.canOrder(itemRequest.getQuantity()) || !product.hasStock(itemRequest.getQuantity())) {
                    throw new IllegalArgumentException("Ürün uygun değil veya stok yetersiz: " + product.getName());
                }

                order.addItem(product, itemRequest.getQuantity());
            }

            order.calculateTotals();
            Order savedOrder = orderRepository.save(order);

            // 🔥 MOCK PAYMENT: Otomatik ödeme başarısı
            savedOrder.setPaymentStatus(Order.PaymentStatus.PAID);
            savedOrder.setStatus(Order.OrderStatus.PAYMENT_CONFIRMED);
            savedOrder = orderRepository.save(savedOrder);

            log.info("Sipariş oluşturuldu (MOCK Ödeme Başarılı) - OrderId: {}, OrderNumber: {}",
                    savedOrder.getId(), savedOrder.getOrderNumber());

            // ✅ BAŞARI: Sipariş kaydedildi, sepeti temizle
            try {
                cartService.clearCart(userId);
                log.info("Sipariş başarılı, sepet temizlendi - UserId: {}", userId);
            } catch (Exception e) {
                log.warn("Sepet temizlenirken hata oluştu (Sipariş süreci etkilenmedi): {}", e.getMessage());
            }

            // Event yayınla (Stock Service'e gitmesi için)
            publishOrderCreatedEvent(savedOrder);

            return OrderResponse.fromEntity(savedOrder);

        } catch (IllegalArgumentException e) {
            log.error("Validasyon hatası - UserId: {} - Hata: {}", userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Sipariş hatası - UserId: {}", userId, e);
            throw new RuntimeException("Sipariş oluşturma işleminde hata oluştu", e);
        }
    }

    public OrderResponse createOrderFallback(CreateOrderRequest request, Long userId, Exception ex) {
        log.error("FALLBACK: Sipariş oluşturma başarısız - UserId: {} - Hata: {}",
                userId, ex.getMessage(), ex);
        throw new RuntimeException("Sipariş oluşturulamadı. Lütfen daha sonra tekrar deneyin.", ex);
    }

    private void publishOrderCreatedEvent(Order order) {
        try {
            List<OrderCreatedEvent.OrderItemDto> items = order.getItems().stream()
                    .map(item -> OrderCreatedEvent.OrderItemDto.builder()
                            .productId(item.getProduct().getId())
                            .productName(item.getProduct().getName())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .build())
                    .collect(Collectors.toList());

            OrderCreatedEvent event = OrderCreatedEvent.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .userId(order.getUser().getId())
                    .totalPrice(order.getTotalPrice())
                    .currency(order.getCurrency())
                    .items(items)
                    .createdAt(LocalDateTime.now())
                    .build();

            kafkaProducer.publishOrderCreated(event);
            log.info("OrderCreatedEvent yayınlandı - OrderId: {}", order.getId());
        } catch (Exception e) {
            log.error("OrderCreatedEvent yayınlanamadı - OrderId: {}", order.getId(), e);
        }
    }

    private String generateOrderNumber() {
        String prefix = "ORD";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return String.format("%s-%s-%s", prefix, timestamp.substring(timestamp.length() - 8), uuid);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderId));

        if (!order.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new IllegalArgumentException("Bu siparişe erişim yetkiniz yok");
        }

        return OrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı: " + userId));

        return orderRepository.findByUser(user, pageable)
                .map(OrderResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderNumber));

        if (!order.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new IllegalArgumentException("Bu siparişe erişim yetkiniz yok");
        }

        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus newStatus, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderId));

        if (!isAdmin(userId)) {
            throw new IllegalArgumentException("Sadece admin bu işlemi yapabilir");
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        log.info("Sipariş durumu güncellendi - OrderId: {}, YeniDurum: {}", orderId, newStatus);
        return OrderResponse.fromEntity(updatedOrder);
    }

    @Transactional
    public OrderResponse updatePaymentStatus(Long orderId, Order.PaymentStatus paymentStatus, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderId));

        if (!isAdmin(userId) && !order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bu işlemi yapma yetkiniz yok");
        }

        order.setPaymentStatus(paymentStatus);
        if (paymentStatus == Order.PaymentStatus.PAID) {
            order.markAsPaid();
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Sipariş ödeme durumu güncellendi - OrderId: {}, YeniDurum: {}", orderId, paymentStatus);
        return OrderResponse.fromEntity(updatedOrder);
    }

    @Transactional
    public OrderResponse shipOrder(Long orderId, String trackingNumber, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderId));

        if (!isAdmin(userId)) {
            throw new IllegalArgumentException("Sadece admin bu işlemi yapabilir");
        }

        order.markAsShipped(trackingNumber);
        Order updatedOrder = orderRepository.save(order);

        log.info("Sipariş kargoya teslim edildi - OrderId: {}, TrackingNumber: {}",
                orderId, trackingNumber);
        return OrderResponse.fromEntity(updatedOrder);
    }

    @Transactional
    public OrderResponse deliverOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderId));

        if (!isAdmin(userId)) {
            throw new IllegalArgumentException("Sadece admin bu işlemi yapabilir");
        }

        order.markAsDelivered();
        Order updatedOrder = orderRepository.save(order);

        log.info("Sipariş teslim edildi - OrderId: {}", orderId);
        return OrderResponse.fromEntity(updatedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, String reason, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderId));

        if (!order.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new IllegalArgumentException("Bu işlemi yapma yetkiniz yok");
        }

        order.cancel(reason);
        Order updatedOrder = orderRepository.save(order);

        log.info("Sipariş iptal edildi - OrderId: {}, Reason: {}", orderId, reason);
        return OrderResponse.fromEntity(updatedOrder);
    }

    private boolean isAdmin(Long userId) {
        return userRepository.findById(userId)
                .map(user -> user.getRole().name().equals("ADMIN"))
                .orElse(false);
    }
}