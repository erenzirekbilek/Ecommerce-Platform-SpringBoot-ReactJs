package com.v1.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cart_id", "product_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"cart", "product"})
@ToString(exclude = {"cart", "product"})
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false, foreignKey = @ForeignKey(name = "fk_cartitem_cart"))
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_cartitem_product"))
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    /**
     * Ürün eklendiği andaki fiyatı
     * (ürünün fiyatı değişebileceği için snapshot alırız)
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

    // ===== Helper Methods =====

    /**
     * Ara toplamı (subtotal) hesaplar ve günceller
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

    /**
     * Ürünün mevcut fiyatını döner
     */
    public BigDecimal getCurrentProductPrice() {
        return product != null ? product.getPrice() : BigDecimal.ZERO;
    }

    /**
     * Fiyat değişip değişmediğini kontrol eder
     */
    public boolean isPriceChanged() {
        if (product == null) return false;
        return !this.unitPrice.equals(product.getPrice());
    }

    /**
     * Fiyat farkını hesaplar
     */
    public BigDecimal getPriceDifference() {
        if (product == null) return BigDecimal.ZERO;
        return product.getPrice().subtract(this.unitPrice);
    }

    /**
     * Miktarı günceller ve ara toplamı yeniden hesaplar
     */
    public void updateQuantity(Integer newQuantity) {
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("Miktar 0'dan büyük olmalıdır");
        }
        this.quantity = newQuantity;
        calculateSubtotal();
    }

    /**
     * Birim fiyatı günceller (normalde yapılmaması gerekir)
     */
    public void updateUnitPrice(BigDecimal newPrice) {
        if (newPrice == null || newPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Fiyat sıfırdan küçük olamaz");
        }
        this.unitPrice = newPrice;
        calculateSubtotal();
    }

    /**
     * Ürünün hala mevcut olup olmadığını kontrol eder
     */
    public boolean isProductAvailable() {
        return product != null && product.isAvailable();
    }

    /**
     * Kullanıcı dostu ürün bilgisini döner (örneğin: "Ürün Adı - 2x123.45 TRY = 246.90 TRY")
     */
    public String getDisplayText() {
        if (product == null) {
            return "Ürün bulunamadı";
        }
        return String.format("%s - %dx%s %s = %s %s",
                product.getName(),
                quantity,
                unitPrice,
                product.getCurrency(),
                getSubtotal(),
                product.getCurrency()
        );
    }
}