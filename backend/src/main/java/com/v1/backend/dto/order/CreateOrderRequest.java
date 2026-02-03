package com.v1.backend.dto.order;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Sipariş oluşturma isteği için DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotEmpty(message = "En az bir ürün gereklidir")
    private List<OrderItemRequest> items;

    @NotBlank(message = "Teslimat adresi zorunludur")
    @Size(max = 500)
    private String shippingAddress;

    @Size(max = 500)
    private String billingAddress;

    @NotBlank(message = "Telefon numarası zorunludur")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Geçersiz telefon numarası")
    private String phoneNumber;

    @NotBlank(message = "Ödeme yöntemi zorunludur")
    @Size(max = 50)
    private String paymentMethod;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {

        @NotNull(message = "Ürün ID zorunludur")
        @Positive(message = "Ürün ID pozitif olmalıdır")
        private Long productId;

        @NotNull(message = "Miktar zorunludur")
        @Positive(message = "Miktar 0'dan büyük olmalıdır")
        private Integer quantity;
    }
}
