package com.v1.backend.repository;

import com.v1.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Aktif kategorileri getir
    List<Category> findByStatusTrue();

    // Ana kategorileri getir (parent = null)
    List<Category> findByParentIsNull();

    // Parent ID'ye göre alt kategorileri getir
    List<Category> findByParentId(Long parentId);

    // Aktif alt kategorileri getir
    List<Category> findByParentIdAndStatusTrue(Long parentId);

    // Slug'a göre kategori bul
    Optional<Category> findBySlug(String slug);

    // Ad'a göre kategori bul
    Optional<Category> findByName(String name);

    // Ad içeriğine göre ara (case-insensitive)
    List<Category> findByNameContainingIgnoreCase(String searchTerm);

    // Slug varlığını kontrol et
    boolean existsBySlug(String slug);

    // Ana kategorileri alt kategorileri ile getir
    @Query("""
        SELECT DISTINCT c
        FROM Category c
        LEFT JOIN FETCH c.children
        WHERE c.parent IS NULL
        ORDER BY c.displayOrder
    """)
    List<Category> findAllMainCategoriesWithChildren();

    // ID'ye göre kategoriyi children'ları ile getir
    @Query("""
        SELECT c
        FROM Category c
        LEFT JOIN FETCH c.children
        WHERE c.id = :id
    """)
    Optional<Category> findByIdWithRelations(@Param("id") Long id);

    // Slug'a göre kategoriyi children'ları ile getir
    @Query("""
        SELECT c
        FROM Category c
        LEFT JOIN FETCH c.children
        WHERE c.slug = :slug
    """)
    Optional<Category> findBySlugWithRelations(@Param("slug") String slug);

    // Tüm kategori ağacını getir
    @Query("""
        SELECT DISTINCT c
        FROM Category c
        LEFT JOIN FETCH c.children
        WHERE c.parent IS NULL
        AND c.status = TRUE
        ORDER BY c.displayOrder
    """)
    List<Category> findCategoryTree();

    // Aktif ana kategoriler + children
    @Query("""
        SELECT DISTINCT c
        FROM Category c
        LEFT JOIN FETCH c.children
        WHERE c.parent IS NULL
        AND c.status = TRUE
        ORDER BY c.displayOrder ASC
    """)
    List<Category> findActiveCategories();
}
