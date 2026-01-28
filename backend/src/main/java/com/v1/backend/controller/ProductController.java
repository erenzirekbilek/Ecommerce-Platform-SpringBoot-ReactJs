package com.v1.backend.controller;

import com.v1.backend.dto.ProductDTO;
import com.v1.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    // CREATE
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        log.info("POST request to create product: {}", productDTO.getName());
        ProductDTO createdProduct = productService.createProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    // READ - Get All with Pagination
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        log.info("GET request for all products - Page: {}, Size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<ProductDTO> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    // READ - Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        log.info("GET request for product id: {}", id);
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    // READ - Get by SKU
    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductDTO> getProductBySku(@PathVariable String sku) {
        log.info("GET request for product SKU: {}", sku);
        ProductDTO product = productService.getProductBySku(sku);
        return ResponseEntity.ok(product);
    }

    // READ - Search Products
    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("GET request to search products with keyword: {}", keyword);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> results = productService.searchProducts(keyword, pageable);
        return ResponseEntity.ok(results);
    }

    // READ - Get by Category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductDTO>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        log.info("GET request for products in category: {}", categoryId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<ProductDTO> products = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(products);
    }

    // NEW: Get by Category and Parent Category Slug
    @GetMapping("/category/{categoryId}/parent-category")
    public ResponseEntity<Page<ProductDTO>> getByCategoryAndParentCategory(
            @PathVariable Long categoryId,
            @RequestParam String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        log.info("GET request for products in category: {} and parent category slug: {}", categoryId, slug);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<ProductDTO> products = productService.getProductsByCategoryAndParentCategorySlug(categoryId, slug, pageable);
        return ResponseEntity.ok(products);
    }

    // NEW: Get by Category and Parent Category IDs (Multiple)
    @GetMapping("/category/{categoryId}/parent-categories")
    public ResponseEntity<Page<ProductDTO>> getByCategoryAndParentCategories(
            @PathVariable Long categoryId,
            @RequestParam Set<Long> parentCategoryIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("GET request for products in category: {} and parent category ids: {}", categoryId, parentCategoryIds);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getProductsByCategoryAndParentCategoryIds(categoryId, parentCategoryIds, pageable);
        return ResponseEntity.ok(products);
    }

    // READ - Get by Brand
    @GetMapping("/brand/{brandId}")
    public ResponseEntity<Page<ProductDTO>> getProductsByBrand(
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("GET request for products by brand: {}", brandId);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getProductsByBrand(brandId, pageable);
        return ResponseEntity.ok(products);
    }

    // READ - Get by Price Range
    @GetMapping("/price-range")
    public ResponseEntity<Page<ProductDTO>> getProductsByPriceRange(
            @RequestParam Long categoryId,
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("GET request for products in price range: {} - {}", minPrice, maxPrice);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getProductsByPriceRange(categoryId, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(products);
    }

    // READ - Top Rated Products
    @GetMapping("/top-rated")
    public ResponseEntity<List<ProductDTO>> getTopRatedProducts() {
        log.info("GET request for top rated products");
        List<ProductDTO> products = productService.getTopRatedProducts();
        return ResponseEntity.ok(products);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDTO productDTO) {

        log.info("PUT request to update product id: {}", id);
        ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    // DELETE - Soft Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        log.info("DELETE request for product id: {}", id);
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }

    // DELETE - Hard Delete (Admin Only)
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<String> hardDeleteProduct(@PathVariable Long id) {
        log.info("HARD DELETE request for product id: {}", id);
        productService.hardDeleteProduct(id);
        return ResponseEntity.ok("Product permanently deleted");
    }

    // STATISTICS
    @GetMapping("/stats/total-count")
    public ResponseEntity<Long> getTotalProductCount() {
        log.info("GET request for total product count");
        long count = productService.getTotalProductCount();
        return ResponseEntity.ok(count);
    }
}