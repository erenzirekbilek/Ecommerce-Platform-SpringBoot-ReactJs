package com.v1.backend.exception;

/**
 * Kategori işlemleri sırasında oluşan hatalar için custom exception
 */
public class CategoryException extends RuntimeException {

    private String errorCode;
    private int httpStatus;

    // ============================================================
    // CONSTRUCTORS
    // ============================================================

    /**
     * Basit hata mesajı ile exception oluştur
     */
    public CategoryException(String message) {
        super(message);
        this.errorCode = "CATEGORY_ERROR";
        this.httpStatus = 400;
    }

    /**
     * Hata mesajı + sebep ile exception oluştur
     */
    public CategoryException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "CATEGORY_ERROR";
        this.httpStatus = 400;
    }

    /**
     * Hata mesajı + error code ile exception oluştur
     */
    public CategoryException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = 400;
    }

    /**
     * Tüm parametreler ile exception oluştur
     */
    public CategoryException(String message, String errorCode, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    /**
     * Hata mesajı + sebep + error code ile exception oluştur
     */
    public CategoryException(String message, Throwable cause, String errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = 400;
    }

    /**
     * Tüm parametreler ile exception oluştur (sebep dahil)
     */
    public CategoryException(String message, Throwable cause, String errorCode, int httpStatus) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    // ============================================================
    // GETTERS
    // ============================================================

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    // ============================================================
    // STATIC FACTORY METHODS (Daha kolay kullanım)
    // ============================================================

    /**
     * Kategori bulunamadı hatası
     */
    public static CategoryException notFound(Long id) {
        return new CategoryException(
                "Kategori bulunamadı (ID: " + id + ")",
                "CATEGORY_NOT_FOUND",
                404
        );
    }

    /**
     * Slug ile kategori bulunamadı hatası
     */
    public static CategoryException notFoundBySlug(String slug) {
        return new CategoryException(
                "Kategori bulunamadı (Slug: " + slug + ")",
                "CATEGORY_NOT_FOUND",
                404
        );
    }

    /**
     * Parent kategori bulunamadı hatası
     */
    public static CategoryException parentNotFound(Long parentId) {
        return new CategoryException(
                "Parent kategori bulunamadı (ID: " + parentId + ")",
                "PARENT_CATEGORY_NOT_FOUND",
                404
        );
    }

    /**
     * Kategori adı geçersiz hatası
     */
    public static CategoryException invalidName(String message) {
        return new CategoryException(
                "Geçersiz kategori adı: " + message,
                "INVALID_CATEGORY_NAME",
                400
        );
    }

    /**
     * Kategori slug geçersiz hatası
     */
    public static CategoryException invalidSlug(String message) {
        return new CategoryException(
                "Geçersiz kategori slug: " + message,
                "INVALID_CATEGORY_SLUG",
                400
        );
    }

    /**
     * Slug zaten var hatası
     */
    public static CategoryException slugAlreadyExists(String slug) {
        return new CategoryException(
                "Bu slug zaten mevcut: " + slug,
                "SLUG_ALREADY_EXISTS",
                400
        );
    }

    /**
     * Circular reference hatası (kategori kendi parent'ı)
     */
    public static CategoryException circularReference(Long categoryId, Long parentId) {
        return new CategoryException(
                "Döngüsel referans: Kategori ID " + categoryId + " kendi parent'ı (ID " + parentId + ") olamaz",
                "CIRCULAR_REFERENCE",
                400
        );
    }

    /**
     * Maksimum derinliğe ulaşıldı hatası
     */
    public static CategoryException maxDepthExceeded(int currentDepth, int maxDepth) {
        return new CategoryException(
                "Maksimum " + maxDepth + " seviye derinliğe izin verilir. Mevcut derinlik: " + currentDepth,
                "MAX_DEPTH_EXCEEDED",
                400
        );
    }

    /**
     * Alt kategori var hatası (silinemiyor)
     */
    public static CategoryException hasChildren(Long categoryId, int childCount) {
        return new CategoryException(
                "Bu kategori " + childCount + " adet alt kategoriye sahip. Lütfen önce alt kategorileri silin.",
                "CATEGORY_HAS_CHILDREN",
                400
        );
    }

    /**
     * Kategori aktif değil hatası
     */
    public static CategoryException categoryInactive(Long id) {
        return new CategoryException(
                "Bu kategori pasif durumdadır (ID: " + id + ")",
                "CATEGORY_INACTIVE",
                400
        );
    }

    /**
     * Parent kategori aktif değil hatası
     */
    public static CategoryException parentCategoryInactive(Long parentId) {
        return new CategoryException(
                "Parent kategori pasif durumdadır (ID: " + parentId + ")",
                "PARENT_CATEGORY_INACTIVE",
                400
        );
    }

    /**
     * Geçersiz display order hatası
     */
    public static CategoryException invalidDisplayOrder(int displayOrder) {
        return new CategoryException(
                "Geçersiz display order: " + displayOrder + " (0 veya daha büyük olmalıdır)",
                "INVALID_DISPLAY_ORDER",
                400
        );
    }

    /**
     * Genel validasyon hatası
     */
    public static CategoryException validationError(String message) {
        return new CategoryException(
                "Validasyon hatası: " + message,
                "VALIDATION_ERROR",
                400
        );
    }

    /**
     * Veritabanı işlemi hatası
     */
    public static CategoryException databaseError(String message, Throwable cause) {
        return new CategoryException(
                "Veritabanı hatası: " + message,
                cause,
                "DATABASE_ERROR",
                500
        );
    }

    /**
     * İşlem sırasında beklenmeyen hata
     */
    public static CategoryException unexpectedError(String message, Throwable cause) {
        return new CategoryException(
                "Beklenmeyen hata: " + message,
                cause,
                "UNEXPECTED_ERROR",
                500
        );
    }
}
