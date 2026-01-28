package com.v1.backend.controller;

import com.v1.backend.dto.*;
import com.v1.backend.dto.category.CategoryCreateRequest;
import com.v1.backend.dto.category.CategoryDTO;
import com.v1.backend.dto.category.CategoryUpdateRequest;
import com.v1.backend.exception.CategoryException;
import com.v1.backend.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;

    // ============================================================
    // GET - OKUMA İŞLEMLERİ
    // ============================================================

    /**
     * Tüm ana kategorileri getir (alt kategorileri ile)
     * GET /api/v1/categories
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllMainCategories() {
        log.info("Ana kategoriler isteniyor");
        List<CategoryDTO> categories = categoryService.getAllMainCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    /**
     * Direkt alt kategorileri getir (recursive değil)
     * GET /api/v1/categories/{parentId}/direct-subcategories
     */
    @GetMapping("/{parentId}/direct-subcategories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getDirectSubcategories(@PathVariable Long parentId) {
        log.info("Direkt alt kategoriler isteniyor: parentId={}", parentId);
        List<CategoryDTO> subcategories = categoryService.getDirectSubcategories(parentId);
        return ResponseEntity.ok(ApiResponse.ok(subcategories));
    }

    /**
     * Tüm aktif kategorileri getir (ana + alt)
     * GET /api/v1/categories/all
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllActiveCategories() {
        log.info("Tüm aktif kategoriler isteniyor");
        List<CategoryDTO> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    /**
     * Kategoriyi ID ile getir
     * GET /api/v1/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(@PathVariable Long id) {
        log.info("Kategori isteniyor: id={}", id);
        CategoryDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.ok(category));
    }

    /**
     * Kategoriyi slug ile getir
     * GET /api/v1/categories/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryBySlug(@PathVariable String slug) {
        log.info("Kategori isteniyor: slug={}", slug);
        CategoryDTO category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(category));
    }

    /**
     * Belirli kategorinin alt kategorilerini getir
     * GET /api/v1/categories/{parentId}/subcategories
     */
    @GetMapping("/{parentId}/subcategories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getSubcategories(@PathVariable Long parentId) {
        log.info("Alt kategoriler isteniyor: parentId={}", parentId);
        List<CategoryDTO> subcategories = categoryService.getSubCategories(parentId);
        return ResponseEntity.ok(ApiResponse.ok(subcategories));
    }

    /**
     * Kategori adına göre ara
     * GET /api/v1/categories/search?q=telefon
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> searchCategories(
            @RequestParam(name = "q") String searchTerm) {
        log.info("Kategori aranıyor: q={}", searchTerm);
        List<CategoryDTO> categories = categoryService.searchCategories(searchTerm);
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    // ============================================================
    // POST - OLUŞTURMA İŞLEMLERİ
    // ============================================================

    /**
     * Yeni ana kategori oluştur
     * POST /api/v1/categories
     *
     * Request Body:
     * {
     *   "name": "Elektronik",
     *   "slug": "elektronik",
     *   "description": "Elektronik ürünleri",
     *   "imageUrl": "https://example.com/image.jpg",
     *   "displayOrder": 1
     * }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDTO>> createMainCategory(
            @Valid @RequestBody CategoryCreateRequest request) {
        log.info("Yeni ana kategori oluşturuluyor: {}", request.getName());
        CategoryDTO category = categoryService.createMainCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(category));
    }

    /**
     * Yeni alt kategori oluştur
     * POST /api/v1/categories/{parentId}/subcategories
     *
     * Request Body:
     * {
     *   "name": "Telefon",
     *   "slug": "telefon",
     *   "description": "Akıllı telefonlar",
     *   "displayOrder": 1
     * }
     */
    @PostMapping("/{parentId}/subcategories")
    public ResponseEntity<ApiResponse<CategoryDTO>> createSubcategory(
            @PathVariable Long parentId,
            @Valid @RequestBody CategoryCreateRequest request) {
        log.info("Yeni alt kategori oluşturuluyor: parentId={}, name={}", parentId, request.getName());
        CategoryDTO category = categoryService.createSubCategory(parentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(category));
    }

    // ============================================================
    // PUT - GÜNCELLEME İŞLEMLERİ
    // ============================================================

    /**
     * Kategoriyi güncelle
     * PUT /api/v1/categories/{id}
     *
     * Request Body:
     * {
     *   "name": "Elektronik Ürünleri",
     *   "slug": "elektronik-urunleri",
     *   "description": "Tüm elektronik ürünleri",
     *   "status": true
     * }
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        log.info("Kategori güncelleniyor: id={}", id);
        CategoryDTO category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok(category));
    }

    // ============================================================
    // DELETE - SİLME İŞLEMLERİ
    // ============================================================

    /**
     * Kategoriyi sil (alt kategorileri de silinir)
     * DELETE /api/v1/categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long id) {
        log.info("Kategori silinecek: id={}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Kategori başarıyla silindi"));
    }

    /**
     * Kategoriyi pasif yap (soft delete)
     * PUT /api/v1/categories/{id}/deactivate
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<String>> deactivateCategory(@PathVariable Long id) {
        log.info("Kategori pasif yapılıyor: id={}", id);
        categoryService.deactivateCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Kategori pasif yapıldı"));
    }

    /**
     * Kategoriyi aktif yap
     * PUT /api/v1/categories/{id}/activate
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<String>> activateCategory(@PathVariable Long id) {
        log.info("Kategori aktif yapılıyor: id={}", id);
        categoryService.activateCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Kategori aktif yapıldı"));
    }

    // ============================================================
    // EXCEPTION HANDLERS
    // ============================================================

    @ExceptionHandler(CategoryException.class)
    public ResponseEntity<ApiResponse<Void>> handleCategoryException(
            CategoryException ex) {
        log.error("CategoryException: {} - Code: {}", ex.getMessage(), ex.getErrorCode());

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode(ex.getErrorCode())
                .build();

        HttpStatus status = HttpStatus.valueOf(ex.getHttpStatus());
        return new ResponseEntity<>(response, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        log.error("Exception: {}", ex.getMessage(), ex);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message("Beklenmeyen bir hata oluştu")
                .errorCode("INTERNAL_SERVER_ERROR")
                .build();

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}