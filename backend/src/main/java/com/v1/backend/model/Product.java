package com.v1.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Slug otomatik generate edilir
    @Column(unique = true, length = 255)
    private String slug;

    @Column(unique = true, length = 50)
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", foreignKey = @ForeignKey(name = "fk_product_brand"))
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", foreignKey = @ForeignKey(name = "fk_product_category"))
    private Category category;

    // eklendi
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "product_parent_categories",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "parent_category_id")
    )
    private Set<Category> parentCategories = new HashSet<>();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 10)
    @Builder.Default
    private String currency = "TRY";

    @Column(name = "weight_gram")
    private Integer weight;

    @Column(length = 100)
    private String dimensions;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    @OrderColumn(name = "image_order")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Column(length = 50)
    private String color;

    @Column(length = 50)
    private String size;

    @Column(name = "average_rating")
    @Builder.Default
    private Double rating = 0.0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Enumerated(EnumType.STRING)
    private Product.ProductStatus status;

    @Column(name = "min_order_quantity")
    @Builder.Default
    private Integer minOrderQuantity = 1;

    @Column(name = "max_order_quantity")
    @Builder.Default
    private Integer maxOrderQuantity = 999999;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    // ===== STOK ALANI =====
    @Column(name = "stock", nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    // Helper Methods
    public boolean isAvailable() {
        return active && status == ProductStatus.ACTIVE && stock > 0;
    }

    public boolean canOrder(Integer quantity) {
        return quantity >= minOrderQuantity && quantity <= maxOrderQuantity && stock >= quantity;
    }

    public boolean hasStock(Integer quantity) {
        return stock != null && stock >= quantity;
    }

    public void decreaseStock(Integer quantity) {
        if (!hasStock(quantity)) {
            throw new IllegalArgumentException("Yeterli stok yok");
        }
        this.stock -= quantity;
    }

    public void increaseStock(Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Miktar 0'dan büyük olmalıdır");
        }
        this.stock += quantity;
    }

    public boolean isOutOfStock() {
        return stock == null || stock <= 0;
    }

    public enum ProductStatus {
        ACTIVE,
        INACTIVE,
        DISCONTINUED,
        DRAFT
    }
}