package com.v1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private Long id;
    private String name;
    private String description;
    private String sku;
    private Long brandId;
    private String brandName;
    private Long categoryId;
    private String categoryName;
    private Set<Long> parentCategoryIds; // sadece ID’leri gönderiyoruz
    private Set<String> parentCategoryNames;
    private BigDecimal price;
    private String currency;
    private Integer weight;
    private String dimensions;
    private List<String> images;
    private String color;
    private String size;
    private Double rating;
    private Integer reviewCount;
    private String status;
    private Integer minOrderQuantity;
    private Integer maxOrderQuantity;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}