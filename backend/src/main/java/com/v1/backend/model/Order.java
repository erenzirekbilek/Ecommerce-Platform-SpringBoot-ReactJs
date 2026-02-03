package com.v1.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "items")
@ToString(exclude = "items")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_user"))
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.AWAITING_PAYMENT;

    @Column(precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(length = 10)
    @Builder.Default
    private String currency = "TRY";

    @Column(length = 500)
    private String shippingAddress;

    @Column(length = 500)
    private String billingAddress;

    @Column(length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ShippingStatus shippingStatus = ShippingStatus.NOT_SHIPPED;

    @Column(length = 100)
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(length = 50)
    private String paymentMethod;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    public OrderItem addItem(Product product, Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Miktar 0'dan büyük olmalıdır");
        }

        OrderItem existingItem = items.stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            return existingItem;
        } else {
            OrderItem newItem = OrderItem.builder()
                    .order(this)
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();
            items.add(newItem);
            return newItem;
        }
    }

    public void calculateTotals() {
        this.subtotal = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (this.subtotal == null) {
            this.subtotal = BigDecimal.ZERO;
        }

        this.totalPrice = this.subtotal
                .add(this.taxAmount != null ? this.taxAmount : BigDecimal.ZERO)
                .add(this.shippingCost != null ? this.shippingCost : BigDecimal.ZERO);
    }

    public boolean canDecrementStock() {
        return items.stream()
                .allMatch(item -> item.getProduct().hasStock(item.getQuantity()));
    }

    public void markAsPaid() {
        this.paymentStatus = PaymentStatus.PAID;
        this.paidAt = LocalDateTime.now();
        this.status = OrderStatus.PAYMENT_CONFIRMED;
    }

    public void markAsConfirmed() {
        if (this.paymentStatus != PaymentStatus.PAID) {
            throw new IllegalStateException("Ödeme yapılmamış siparişler onaylanamaz");
        }
        this.status = OrderStatus.STOCK_RESERVED;
    }

    public void markAsReadyForShipment() {
        this.status = OrderStatus.READY_FOR_SHIPMENT;
    }

    public void markAsShipped(String trackingNumber) {
        if (this.status != OrderStatus.READY_FOR_SHIPMENT) {
            throw new IllegalStateException("Sadece gönderime hazır siparişler gönderilebilir");
        }
        this.shippingStatus = ShippingStatus.SHIPPED;
        this.trackingNumber = trackingNumber;
        this.status = OrderStatus.SHIPPED;
    }

    public void markAsDelivered() {
        if (this.shippingStatus != ShippingStatus.SHIPPED) {
            throw new IllegalStateException("Henüz kargo gönderilememiş siparişler teslim edilemez");
        }
        this.shippingStatus = ShippingStatus.DELIVERED;
        this.status = OrderStatus.DELIVERED;
    }

    public void cancel(String reason) {
        if (this.status == OrderStatus.SHIPPED || this.status == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Kargo gönderilen siparişler iptal edilemez");
        }
        this.status = OrderStatus.CANCELLED;
    }

    public Integer getTotalItemCount() {
        return items.stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
    }

    public enum OrderStatus {
        AWAITING_PAYMENT,
        PAYMENT_CONFIRMED,
        STOCK_RESERVED,
        READY_FOR_SHIPMENT,
        SHIPPED,
        DELIVERED,
        CANCELLED,
        PAYMENT_FAILED,
        STOCK_RESERVATION_FAILED
    }

    public enum ShippingStatus {
        NOT_SHIPPED,
        SHIPPED,
        DELIVERED
    }

    public enum PaymentStatus {
        PENDING,
        PAID,
        FAILED,
        REFUNDED
    }
}