package com.v1.backend.exception;

import com.v1.backend.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * CategoryException handler
     */
    @ExceptionHandler(CategoryException.class)
    public ResponseEntity<ApiResponse<Void>> handleCategoryException(
            CategoryException ex,
            WebRequest request) {

        log.error("CategoryException: {} - Error Code: {}", ex.getMessage(), ex.getErrorCode(), ex);

        HttpStatus httpStatus = HttpStatus.valueOf(ex.getHttpStatus());

        // Düzeltilmiş: static error metodunu kullanıyoruz
        ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode());

        return new ResponseEntity<>(response, httpStatus);
    }

    /**
     * Validation Exception handler (DTO validasyonu başarısız)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException ex,
            WebRequest request) {

        log.error("Validation Exception: {}", ex.getMessage());

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((e1, e2) -> e1 + ", " + e2)
                .orElse("Validasyon hatası");

        // Düzeltilmiş: static error metodunu kullanıyoruz
        ApiResponse<Void> response = ApiResponse.error(message, "VALIDATION_ERROR");

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * RuntimeException handler
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(
            RuntimeException ex,
            WebRequest request) {

        log.error("RuntimeException: {}", ex.getMessage(), ex);

        // Düzeltilmiş: static error metodunu kullanıyoruz
        ApiResponse<Void> response = ApiResponse.error("Beklenmeyen bir hata oluştu", "INTERNAL_SERVER_ERROR");

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Genel Exception handler
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(
            Exception ex,
            WebRequest request) {

        log.error("Exception: {}", ex.getMessage(), ex);

        // Düzeltilmiş: static error metodunu kullanıyoruz
        ApiResponse<Void> response = ApiResponse.error("Sunucu hatası", "SERVER_ERROR");

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
