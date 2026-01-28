package com.v1.backend.service;

import com.v1.backend.dto.ProductDTO;
import com.v1.backend.model.Brand;
import com.v1.backend.model.Category;
import com.v1.backend.model.Product;
import com.v1.backend.repository.BrandRepository;
import com.v1.backend.repository.CategoryRepository;
import com.v1.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    // CREATE
    public ProductDTO createProduct(ProductDTO productDTO) {
        log.info("Creating product with SKU: {}", productDTO.getSku());

        if (productRepository.existsBySku(productDTO.getSku())) {
            throw new IllegalArgumentException("Product with SKU " + productDTO.getSku() + " already exists");
        }

        Brand brand = brandRepository.findById(productDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + productDTO.getBrandId()));

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategoryId()));

        // Parent categories entegrasyonu
        Set<Category> parentCategories = new HashSet<>();
        if (productDTO.getParentCategoryIds() != null && !productDTO.getParentCategoryIds().isEmpty()) {
            parentCategories = categoryRepository.findAllById(productDTO.getParentCategoryIds())
                    .stream().collect(Collectors.toSet());
        }

        Product product = Product.builder()
                .name(productDTO.getName())
                .description(productDTO.getDescription())
                .slug(generateSlug(productDTO.getName()))
                .sku(productDTO.getSku())
                .brand(brand)
                .category(category)
                .parentCategories(parentCategories)
                .price(productDTO.getPrice())
                .currency(productDTO.getCurrency() != null ? productDTO.getCurrency() : "TRY")
                .weight(productDTO.getWeight())
                .dimensions(productDTO.getDimensions())
                .images(productDTO.getImages())
                .color(productDTO.getColor())
                .size(productDTO.getSize())
                .minOrderQuantity(productDTO.getMinOrderQuantity() != null ? productDTO.getMinOrderQuantity() : 1)
                .maxOrderQuantity(productDTO.getMaxOrderQuantity() != null ? productDTO.getMaxOrderQuantity() : 999999)
                .status(Product.ProductStatus.ACTIVE)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with id: {}", savedProduct.getId());
        return convertToDTO(savedProduct);
    }

    // READ
    public ProductDTO getProductById(Long id) {
        log.info("Fetching product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return convertToDTO(product);
    }

    public ProductDTO getProductBySku(String sku) {
        log.info("Fetching product with SKU: {}", sku);
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        return convertToDTO(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        log.info("Fetching all products - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<Product> products = productRepository.findAllActive(pageable);
        return products.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProducts(String keyword, Pageable pageable) {
        log.info("Searching products with keyword: {}", keyword);
        Page<Product> products = productRepository.searchProducts(keyword, pageable);
        return products.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        log.info("Fetching products for category: {}", categoryId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        Page<Product> products = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
        return products.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByBrand(Long brandId, Pageable pageable) {
        log.info("Fetching products for brand: {}", brandId);
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + brandId));
        Page<Product> products = productRepository.findByBrandIdAndActiveTrue(brandId, pageable);
        return products.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByPriceRange(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        log.info("Fetching products by price range - Min: {}, Max: {}", minPrice, maxPrice);
        Page<Product> products = productRepository.findByCategoryAndPriceRange(categoryId, minPrice, maxPrice, pageable);
        return products.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getTopRatedProducts() {
        log.info("Fetching top 10 rated products");
        List<Product> products = productRepository.findTop10ByStatusAndActiveTrueOrderByRatingDesc();
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // NEW: Alt kategori filtresi - Slug ile
    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByCategoryAndParentCategorySlug(
            Long categoryId,
            String slug,
            Pageable pageable) {

        log.info("Fetching products for category: {} and parent category slug: {}", categoryId, slug);

        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        Page<Product> products = productRepository.findByCategoryAndParentCategorySlug(categoryId, slug, pageable);
        return products.map(this::convertToDTO);
    }

    // NEW: Alt kategori filtresi - Birden fazla ID ile
    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByCategoryAndParentCategoryIds(
            Long categoryId,
            Set<Long> parentCategoryIds,
            Pageable pageable) {

        log.info("Fetching products for category: {} and parent category ids: {}", categoryId, parentCategoryIds);

        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        if (parentCategoryIds == null || parentCategoryIds.isEmpty()) {
            throw new IllegalArgumentException("Parent category ids cannot be empty");
        }

        Page<Product> products = productRepository.findByCategoryAndParentCategoryIds(categoryId, parentCategoryIds, pageable);
        return products.map(this::convertToDTO);
    }

    // UPDATE
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        log.info("Updating product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setWeight(productDTO.getWeight());
        product.setDimensions(productDTO.getDimensions());
        product.setImages(productDTO.getImages());
        product.setColor(productDTO.getColor());
        product.setSize(productDTO.getSize());
        product.setMinOrderQuantity(productDTO.getMinOrderQuantity());
        product.setMaxOrderQuantity(productDTO.getMaxOrderQuantity());

        if (productDTO.getBrandId() != null) {
            Brand brand = brandRepository.findById(productDTO.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found"));
            product.setBrand(brand);
        }

        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        // Parent categories güncelleme
        if (productDTO.getParentCategoryIds() != null) {
            Set<Category> parentCategories = new HashSet<>();
            if (!productDTO.getParentCategoryIds().isEmpty()) {
                parentCategories = categoryRepository.findAllById(productDTO.getParentCategoryIds())
                        .stream().collect(Collectors.toSet());
            }
            product.setParentCategories(parentCategories);
        }

        Product updatedProduct = productRepository.save(product);
        log.info("Product updated successfully");
        return convertToDTO(updatedProduct);
    }

    // DELETE
    public void deleteProduct(Long id) {
        log.info("Deleting product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setActive(false);
        productRepository.save(product);
        log.info("Product deleted (soft delete) successfully");
    }

    public void hardDeleteProduct(Long id) {
        log.info("Hard deleting product with id: {}", id);
        productRepository.deleteById(id);
        log.info("Product hard deleted successfully");
    }

    // STATISTICS
    public long getTotalProductCount() {
        log.info("Fetching total product count");
        return productRepository.countByActiveTrue();
    }

    // HELPER METHODS
    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    // UTILITY
    private ProductDTO convertToDTO(Product product) {
        Set<Long> parentCategoryIds = product.getParentCategories() != null ?
                product.getParentCategories().stream()
                        .map(Category::getId)
                        .collect(Collectors.toSet())
                : new HashSet<>();

        Set<String> parentCategoryNames = product.getParentCategories() != null ?
                product.getParentCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.toSet())
                : new HashSet<>();

        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .sku(product.getSku())
                .brandId(product.getBrand().getId())
                .brandName(product.getBrand().getName())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .parentCategoryIds(parentCategoryIds)
                .parentCategoryNames(parentCategoryNames)
                .price(product.getPrice())
                .currency(product.getCurrency())
                .weight(product.getWeight())
                .dimensions(product.getDimensions())
                .images(product.getImages())
                .color(product.getColor())
                .size(product.getSize())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .status(product.getStatus().toString())
                .minOrderQuantity(product.getMinOrderQuantity())
                .maxOrderQuantity(product.getMaxOrderQuantity())
                .active(product.getActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}