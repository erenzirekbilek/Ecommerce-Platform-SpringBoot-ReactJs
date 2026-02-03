package com.v1.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"order_id", "product_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"order", "product"})
@ToString(exclude = {"order", "product"})
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_orderitem_order"))
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_orderitem_product"))
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    /**
     * Sipariş oluşturulduğu andaki ürün fiyatı (snapshot)
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    /**
     * Ara toplam: quantity * unitPrice
     */
    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    // ===== HELPER METHODS =====

    /**
     * Ara toplamı hesaplar ve günceller
     */
    @PrePersist
    @PreUpdate
    public void calculateSubtotal() {
        if (this.unitPrice != null && this.quantity != null) {
            this.subtotal = this.unitPrice.multiply(new BigDecimal(this.quantity));
        }
    }

    /**
     * Ara toplamı döner
     */
    public BigDecimal getSubtotal() {
        if (this.subtotal == null) {
            calculateSubtotal();
        }
        return this.subtotal != null ? this.subtotal : BigDecimal.ZERO;
    }
}