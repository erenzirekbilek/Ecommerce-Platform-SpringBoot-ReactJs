package com.v1.backend.controller;

import com.v1.backend.dto.cart.AddToCartRequest;
import com.v1.backend.dto.ApiResponse;
import com.v1.backend.dto.cart.CartDTO;
import com.v1.backend.dto.cart.UpdateCartItemRequest;
import com.v1.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartDTO>> getCart(@PathVariable Long userId) {
        log.info("Sepet getiriliyor - UserId: {}", userId);
        try {
            CartDTO cart = cartService.getCart(userId);
            return ResponseEntity.ok(ApiResponse.success("Sepet başarıyla getirildi", cart));
        } catch (Exception e) {
            log.error("Sepet getirilirken hata oluştu - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Sepet getirilirken hata oluştu: " + e.getMessage()));
        }
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<ApiResponse<CartDTO>> addToCart(
            @PathVariable Long userId,
            @RequestBody AddToCartRequest request) {
        log.info("Sepete ürün ekleniyor - UserId: {}, ProductId: {}, Quantity: {}",
                userId, request.getProductId(), request.getQuantity());
        try {
            if (request.getProductId() == null || request.getProductId() <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Geçersiz ürün ID'si"));
            }
            if (request.getQuantity() == null || request.getQuantity() <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Miktar 0'dan büyük olmalıdır"));
            }

            CartDTO cart = cartService.addToCart(userId, request.getProductId(), request.getQuantity());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Ürün sepete başarıyla eklendi", cart));
        } catch (IllegalArgumentException e) {
            log.warn("Sepete ürün eklenirken validasyon hatası - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Sepete ürün eklenirken hata oluştu - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Sepete ürün eklenirken hata oluştu: " + e.getMessage()));
        }
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<ApiResponse<CartDTO>> updateCartItem(
            @PathVariable Long userId,
            @RequestBody UpdateCartItemRequest request) {
        log.info("Sepetteki ürün güncelleniyor - UserId: {}, ProductId: {}, NewQuantity: {}",
                userId, request.getProductId(), request.getQuantity());
        try {
            if (request.getProductId() == null || request.getProductId() <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Geçersiz ürün ID'si"));
            }
            if (request.getQuantity() == null || request.getQuantity() <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Miktar 0'dan büyük olmalıdır"));
            }

            CartDTO cart = cartService.updateCartItemQuantity(userId, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(ApiResponse.success("Ürün miktarı başarıyla güncellendi", cart));
        } catch (IllegalArgumentException e) {
            log.warn("Ürün güncellenirken validasyon hatası - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Ürün güncellenirken hata oluştu - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Ürün güncellenirken hata oluştu: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/remove/{productId}")
    public ResponseEntity<ApiResponse<CartDTO>> removeFromCart(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        log.info("Sepetten ürün kaldırılıyor - UserId: {}, ProductId: {}", userId, productId);
        try {
            CartDTO cart = cartService.removeFromCart(userId, productId);
            return ResponseEntity.ok(ApiResponse.success("Ürün sepetten başarıyla kaldırıldı", cart));
        } catch (IllegalArgumentException e) {
            log.warn("Ürün kaldırılırken validasyon hatası - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Ürün kaldırılırken hata oluştu - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Ürün kaldırılırken hata oluştu: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<ApiResponse<String>> clearCart(@PathVariable Long userId) {
        log.info("Sepet temizleniyor - UserId: {}", userId);
        try {
            cartService.clearCart(userId);
            return ResponseEntity.ok(ApiResponse.success("Sepet başarıyla temizlendi", null));
        } catch (IllegalArgumentException e) {
            log.warn("Sepet temizlenirken validasyon hatası - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Sepet temizlenirken hata oluştu - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Sepet temizlenirken hata oluştu: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}/count")
    public ResponseEntity<ApiResponse<Integer>> getCartItemCount(@PathVariable Long userId) {
        log.info("Sepet ürün sayısı getiriliyor - UserId: {}", userId);
        try {
            Integer count = cartService.getCartItemCount(userId);
            return ResponseEntity.ok(ApiResponse.success("Sepet ürün sayısı başarıyla getirildi", count));
        } catch (Exception e) {
            log.error("Sepet ürün sayısı getirilirken hata oluştu - UserId: {}, Error: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Sepet ürün sayısı getirilirken hata oluştu: " + e.getMessage()));
        }
    }
}