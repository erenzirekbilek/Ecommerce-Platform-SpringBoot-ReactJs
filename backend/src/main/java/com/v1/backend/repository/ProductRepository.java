package com.v1.backend.repository;

import com.v1.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    Page<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name, Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    Page<Product> findByBrandIdAndActiveTrue(Long brandId, Pageable pageable);

    List<Product> findByActiveTrue();

    List<Product> findByStatusAndActiveTrue(Product.ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.status = 'ACTIVE' " +
            "ORDER BY p.createdAt DESC")
    Page<Product> findAllActive(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.status = 'ACTIVE' " +
            "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.price BETWEEN :minPrice AND :maxPrice " +
            "AND p.active = true AND p.status = 'ACTIVE'")
    Page<Product> findByCategoryAndPriceRange(
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    boolean existsBySku(String sku);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.active = true ORDER BY p.rating DESC LIMIT 10")
    List<Product> findTop10ByStatusAndActiveTrueOrderByRatingDesc();

    long countByActiveTrue();

    @Query("""
        SELECT p FROM Product p
        JOIN p.parentCategories pc
        WHERE p.category.id = :categoryId
          AND pc.slug = :slug
          AND p.active = true
          AND p.status = 'ACTIVE'
    """)
    Page<Product> findByCategoryAndParentCategorySlug(
            @Param("categoryId") Long categoryId,
            @Param("slug") String slug,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Product p
        JOIN p.parentCategories pc
        WHERE p.category.id = :categoryId
          AND pc.id IN :parentCategoryIds
          AND p.active = true
          AND p.status = 'ACTIVE'
    """)
    Page<Product> findByCategoryAndParentCategoryIds(
            @Param("categoryId") Long categoryId,
            @Param("parentCategoryIds") Set<Long> parentCategoryIds,
            Pageable pageable
    );
}