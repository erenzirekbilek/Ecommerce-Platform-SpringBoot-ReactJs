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
@Table(name = "carts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "items")
@ToString(exclude = "items")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_cart_user"))
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @Column(name = "total_price", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(name = "total_quantity")
    @Builder.Default
    private Integer totalQuantity = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    public CartItem addItem(Product product, Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Miktar 0'dan büyük olmalıdır");
        }

        if (!product.isAvailable()) {
            throw new IllegalArgumentException("Ürün şu anda sipariş verilemez");
        }

        if (!product.canOrder(quantity)) {
            throw new IllegalArgumentException(
                    String.format("Miktar %d - %d arasında olmalıdır",
                            product.getMinOrderQuantity(),
                            product.getMaxOrderQuantity())
            );
        }

        // Stok kontrolü
        if (product.getStock() == null || product.getStock() < quantity) {
            throw new IllegalArgumentException(
                    String.format("Yeterli stok yok. Mevcut stok: %d, İstenen miktar: %d",
                            product.getStock() != null ? product.getStock() : 0, quantity)
            );
        }

        CartItem existingItem = items.stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + quantity;

            // Toplam miktar için stok kontrolü
            if (product.getStock() == null || product.getStock() < newQuantity) {
                throw new IllegalArgumentException(
                        String.format("Yeterli stok yok. Mevcut stok: %d, İstenen toplam miktar: %d",
                                product.getStock() != null ? product.getStock() : 0, newQuantity)
                );
            }

            existingItem.setQuantity(newQuantity);
            return existingItem;
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(this)
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();
            items.add(newItem);
            return newItem;
        }
    }

    public void removeItem(Long productId) {
        items.removeIf(item -> item.getProduct().getId().equals(productId));
    }

    public void updateItemQuantity(Long productId, Integer newQuantity) {
        if (newQuantity <= 0) {
            removeItem(productId);
            return;
        }

        CartItem item = items.stream()
                .filter(ci -> ci.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Ürün sepette bulunamadı"));

        Product product = item.getProduct();
        if (!product.canOrder(newQuantity)) {
            throw new IllegalArgumentException(
                    String.format("Miktar %d - %d arasında olmalıdır",
                            product.getMinOrderQuantity(),
                            product.getMaxOrderQuantity())
            );
        }

        // Stok kontrolü
        if (product.getStock() == null || product.getStock() < newQuantity) {
            throw new IllegalArgumentException(
                    String.format("Yeterli stok yok. Mevcut stok: %d, İstenen miktar: %d",
                            product.getStock() != null ? product.getStock() : 0, newQuantity)
            );
        }

        item.setQuantity(newQuantity);
    }

    public BigDecimal calculateTotalPrice() {
        return items.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Integer calculateTotalQuantity() {
        return items.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    public void updateTotals() {
        this.totalPrice = calculateTotalPrice();
        this.totalQuantity = calculateTotalQuantity();
    }

    public void clear() {
        items.clear();
        this.totalPrice = BigDecimal.ZERO;
        this.totalQuantity = 0;
    }

    public boolean isEmpty() {
        return items == null || items.isEmpty();
    }

    public boolean isNotEmpty() {
        return !isEmpty();
    }
}