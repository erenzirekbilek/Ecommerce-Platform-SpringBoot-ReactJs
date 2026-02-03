package com.v1.backend.controller;

import com.v1.backend.dto.order.CreateOrderRequest;
import com.v1.backend.dto.order.OrderResponse;
import com.v1.backend.model.Order;
import com.v1.backend.model.User;
import com.v1.backend.repository.UserRepository;
import com.v1.backend.service.OrderService;
import com.v1.backend.utils.InvoicePdfGenerator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final InvoicePdfGenerator invoicePdfGenerator;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/v1/orders
     * Yeni sipariş oluşturur
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        log.info("POST /api/v1/orders - Sipariş oluşturma isteği alındı");

        try {
            Long userId = getCurrentUserId();
            OrderResponse orderResponse = orderService.createOrder(request, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sipariş başarıyla oluşturuldu");
            response.put("data", orderResponse);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Validasyon hatası - Hata: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            log.error("Sipariş oluşturmada hata", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Sipariş oluşturulamadı. Lütfen daha sonra tekrar deneyin.");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * GET /api/v1/orders/{orderId}
     * Sipariş detaylarını getirir
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable Long orderId) {
        log.info("GET /api/v1/orders/{} - Sipariş detayı isteği", orderId);

        try {
            Long userId = getCurrentUserId();
            OrderResponse orderResponse = orderService.getOrderById(orderId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", orderResponse);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Sipariş bulunamadı - Hata: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            log.error("Sipariş getirmede hata", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Sipariş getirilemedi");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * GET /api/v1/orders/number/{orderNumber}
     * Sipariş numarası ile bulur
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(@PathVariable String orderNumber) {
        log.info("GET /api/v1/orders/number/{} - Sipariş getirme isteği", orderNumber);

        try {
            Long userId = getCurrentUserId();
            OrderResponse orderResponse = orderService.getOrderByOrderNumber(orderNumber, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", orderResponse);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Sipariş bulunamadı - Hata: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * GET /api/v1/orders
     * Kullanıcının siparişlerini paginated olarak getirir
     */
    @GetMapping
    public ResponseEntity<?> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("GET /api/v1/orders - Kullanıcı siparişleri isteği");

        try {
            Long userId = getCurrentUserId();

            Sort.Direction direction = sortDirection.equalsIgnoreCase("asc")
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;

            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            Page<OrderResponse> orders = orderService.getUserOrders(userId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", orders.getContent());
            response.put("pagination", Map.of(
                    "totalElements", orders.getTotalElements(),
                    "totalPages", orders.getTotalPages(),
                    "currentPage", orders.getNumber(),
                    "pageSize", orders.getSize()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Siparişler getirilemedi", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Siparişler getirilemedi");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * PATCH /api/v1/orders/{orderId}/status
     * Sipariş durumunu günceller (ADMIN)
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status) {
        log.info("PATCH /api/v1/orders/{}/status - Status: {}", orderId, status);

        try {
            Long userId = getCurrentUserId();
            OrderResponse orderResponse = orderService.updateOrderStatus(orderId, status, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sipariş durumu güncellendi");
            response.put("data", orderResponse);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Güncelleme hatası - Hata: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            log.error("Sipariş durumu güncellemede hata", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Durum güncellenemedi");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * PATCH /api/v1/orders/{orderId}/payment-status
     * Ödeme durumunu günceller
     */
    @PatchMapping("/{orderId}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestParam Order.PaymentStatus paymentStatus) {
        log.info("PATCH /api/v1/orders/{}/payment-status - PaymentStatus: {}", orderId, paymentStatus);

        try {
            Long userId = getCurrentUserId();
            OrderResponse orderResponse = orderService.updatePaymentStatus(orderId, paymentStatus, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ödeme durumu güncellendi");
            response.put("data", orderResponse);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Güncelleme hatası - Hata: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }

    /**
     * PATCH /api/v1/orders/{orderId}/ship
     * Siparişi kargoya teslim eder (ADMIN)
     */
    @PatchMapping("/{orderId}/ship")
    public ResponseEntity<?> shipOrder(
            @PathVariable Long orderId,
            @RequestParam String trackingNumber) {
        log.info("PATCH /api/v1/orders/{}/ship - TrackingNumber: {}", orderId, trackingNumber);

        try {
            Long userId = getCurrentUserId();
            OrderResponse orderResponse = orderService.shipOrder(orderId, trackingNumber, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sipariş kargoya teslim edildi");
            response.put("data", orderResponse);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Kargo işlemi hatası - Hata: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }

    /**
     * PATCH /api/v1/orders/{orderId}/deliver
     * Siparişi teslim edildi olarak işaretler (ADMIN)
     */
    @PatchMapping("/{orderId}/deliver")
    public ResponseEntity<?> deliverOrder(@PathVariable Long orderId) {
        log.info("PATCH /api/v1/orders/{}/deliver", orderId);

        try {
            Long userId = getCurrentUserId();
            OrderResponse orderResponse = orderService.deliverOrder(orderId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sipariş teslim edildi olarak işaretlendi");
            response.put("data", orderResponse);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Teslimat işlemi hatası - Hata: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }

    /**
     * DELETE /api/v1/orders/{orderId}/cancel
     * Siparişi iptal eder
     */
    @DeleteMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false, defaultValue = "Kullanıcı tarafından iptal edildi") String reason) {
        log.info("DELETE /api/v1/orders/{}/cancel - Reason: {}", orderId, reason);

        try {
            Long userId = getCurrentUserId();
            OrderResponse orderResponse = orderService.cancelOrder(orderId, reason, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sipariş iptal edildi");
            response.put("data", orderResponse);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("İptal işlemi hatası - Hata: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            log.error("Sipariş iptal edilemedi", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Sipariş iptal edilemedi");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Mevcut kullanıcı ID'sini getirir
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Kullanıcı kimliği doğrulanamadı");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + email));
    }

    @GetMapping("/{orderId}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            OrderResponse order = orderService.getOrderById(orderId, userId);
            Order orderEntity = orderService.getOrderEntity(orderId);

            byte[] pdfBytes = invoicePdfGenerator.generateInvoicePdf(orderEntity);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + order.getOrderNumber() + "-Fatura.pdf\"")
                    .header("Content-Type", "application/pdf")
                    .body(pdfBytes);

        } catch (Exception e) {
            log.error("Fatura indirme hatası - OrderId: {}", orderId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private Long extractUserIdFromToken(String authHeader) {
        // JWT token'dan user ID çıkar
        // Implementation depends on your JWT library
        return 1L; // Placeholder
    }
}