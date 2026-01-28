package com.v1.backend.service;

import com.v1.backend.dto.cart.CartDTO;
import com.v1.backend.dto.cart.CartItemDTO;
import com.v1.backend.model.Cart;
import com.v1.backend.model.CartItem;
import com.v1.backend.model.Product;
import com.v1.backend.model.User;
import com.v1.backend.repository.CartItemRepository;
import com.v1.backend.repository.CartRepository;
import com.v1.backend.repository.ProductRepository;
import com.v1.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    // ===== REDIS CONSTANTS =====
    private static final String CART_CACHE_PREFIX = "cart:";
    private static final long CACHE_EXPIRY_MINUTES = 30;

    /**
     * ✅ Sepeti getir veya oluştur
     */
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı: " + userId));

                    Cart newCart = Cart.builder()
                            .user(user)
                            .totalPrice(BigDecimal.ZERO)
                            .totalQuantity(0)
                            .active(true)
                            .build();

                    return cartRepository.save(newCart);
                });
    }

    /**
     * ✅ Sepete ürün ekle
     */
    public CartDTO addToCart(Long userId, Long productId, Integer quantity) {
        log.info("➕ Sepete ürün ekleniyor - UserId: {}, ProductId: {}, Quantity: {}", userId, productId, quantity);

        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı: " + productId));

        if (!product.isAvailable()) {
            throw new IllegalArgumentException("Bu ürün şu anda sipariş verilemez");
        }

        if (!product.canOrder(quantity)) {
            throw new IllegalArgumentException(
                    String.format("Miktar %d - %d arasında olmalıdır",
                            product.getMinOrderQuantity(),
                            product.getMaxOrderQuantity())
            );
        }

        // Stok kontrolü
        if (product.getStock() == null || product.getStock() < quantity) {
            throw new IllegalArgumentException(
                    String.format("Yeterli stok yok. Mevcut stok: %d, İstenen miktar: %d",
                            product.getStock() != null ? product.getStock() : 0, quantity)
            );
        }

        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + quantity;
            if (!product.canOrder(newQuantity)) {
                throw new IllegalArgumentException(
                        String.format("Toplam miktar %d - %d arasında olmalıdır",
                                product.getMinOrderQuantity(),
                                product.getMaxOrderQuantity())
                );
            }

            // Stok kontrolü - toplam miktar için
            if (product.getStock() == null || product.getStock() < newQuantity) {
                throw new IllegalArgumentException(
                        String.format("Yeterli stok yok. Mevcut stok: %d, İstenen toplam miktar: %d",
                                product.getStock() != null ? product.getStock() : 0, newQuantity)
                );
            }

            existingItem.setQuantity(newQuantity);
            existingItem.calculateSubtotal();
            log.info("✏️ Sepetteki ürün miktarı güncellendi - ProductId: {}, NewQuantity: {}", productId, newQuantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();
            newItem.calculateSubtotal();
            cart.getItems().add(newItem);
            log.info("✨ Yeni ürün sepete eklendi - ProductId: {}, Quantity: {}", productId, quantity);
        }

        cart.updateTotals();
        cartRepository.save(cart);

        // 🔴 Redis cache'i temizle
        invalidateCartCache(userId);

        CartDTO cartDTO = convertToDTO(cart);
        log.info("✅ Ürün sepete ekleme başarılı - CartId: {}", cart.getId());
        return cartDTO;
    }

    /**
     * ✅ Sepetten ürün kaldır
     */
    public CartDTO removeFromCart(Long userId, Long productId) {
        log.info("❌ Sepetten ürün kaldırılıyor - UserId: {}, ProductId: {}", userId, productId);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Sepet bulunamadı"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new IllegalArgumentException("Ürün sepette bulunamadı"));

        cartItemRepository.delete(item);
        cart.getItems().remove(item);
        cart.updateTotals();
        cartRepository.save(cart);

        // 🔴 Redis cache'i temizle
        invalidateCartCache(userId);

        log.info("✅ Ürün sepetten kaldırılıyor - ProductId: {}", productId);
        return convertToDTO(cart);
    }

    /**
     * ✅ Sepetteki ürünün miktarını güncelle
     */
    public CartDTO updateCartItemQuantity(Long userId, Long productId, Integer newQuantity) {
        log.info("🔄 Sepetteki ürün güncelleniyor - UserId: {}, ProductId: {}, NewQuantity: {}",
                userId, productId, newQuantity);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Sepet bulunamadı"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new IllegalArgumentException("Ürün sepette bulunamadı"));

        Product product = item.getProduct();

        if (newQuantity <= 0) {
            log.info("⚠️ Miktar 0 olduğu için ürün silinir");
            return removeFromCart(userId, productId);
        }

        if (!product.canOrder(newQuantity)) {
            throw new IllegalArgumentException(
                    String.format("Miktar %d - %d arasında olmalıdır",
                            product.getMinOrderQuantity(),
                            product.getMaxOrderQuantity())
            );
        }

        // Stok kontrolü
        if (product.getStock() == null || product.getStock() < newQuantity) {
            throw new IllegalArgumentException(
                    String.format("Yeterli stok yok. Mevcut stok: %d, İstenen miktar: %d",
                            product.getStock() != null ? product.getStock() : 0, newQuantity)
            );
        }

        item.setQuantity(newQuantity);
        item.calculateSubtotal();
        cart.updateTotals();
        cartRepository.save(cart);

        // 🔴 Redis cache'i temizle
        invalidateCartCache(userId);

        log.info("✅ Ürün miktarı güncellendi - ProductId: {}, NewQuantity: {}", productId, newQuantity);
        return convertToDTO(cart);
    }

    /**
     * ✅ Sepeti temizle
     */
    public void clearCart(Long userId) {
        log.info("🗑️ Sepet temizleniyor - UserId: {}", userId);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Sepet bulunamadı"));

        cartItemRepository.deleteByCartId(cart.getId());
        cart.clear();
        cartRepository.save(cart);

        // 🔴 Redis cache'i temizle
        invalidateCartCache(userId);

        log.info("✅ Sepet temizlendi - UserId: {}", userId);
    }

    /**
     * ✅ Sepeti getir (Redis'den varsa, yoksa DB'den)
     */
    @Transactional(readOnly = true)
    public CartDTO getCart(Long userId) {
        log.info("🛒 Sepet getiriliyor - UserId: {}", userId);

        // 1️⃣ Redis'den kontrol et
        String cacheKey = CART_CACHE_PREFIX + userId;
        CartDTO cachedCart = (CartDTO) redisTemplate.opsForValue().get(cacheKey);

        if (cachedCart != null) {
            log.info("✅ Sepet Redis'den alındı - UserId: {}", userId);
            return cachedCart;
        }

        log.info("⚠️ Sepet Redis'de yok, Database'den alınıyor - UserId: {}", userId);

        // 2️⃣ Database'den getir
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Sepet bulunamadı"));

        CartDTO cartDTO = convertToDTO(cart);

        // 3️⃣ Redis'e cache et
        redisTemplate.opsForValue().set(
                cacheKey,
                cartDTO,
                CACHE_EXPIRY_MINUTES,
                TimeUnit.MINUTES
        );

        log.info("💾 Sepet Redis'e cache edildi - UserId: {}, TTL: {} min", userId, CACHE_EXPIRY_MINUTES);

        return cartDTO;
    }

    /**
     * ✅ Sepetteki ürün sayısını getir
     */
    @Transactional(readOnly = true)
    public Integer getCartItemCount(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Sepet bulunamadı"));
        return cart.getTotalQuantity();
    }

    /**
     * ✅ DTO dönüşümü
     */
    private CartDTO convertToDTO(Cart cart) {
        List<CartItemDTO> items = cart.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());

        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(items)
                .totalPrice(cart.getTotalPrice())
                .totalQuantity(cart.getTotalQuantity())
                .active(cart.getActive())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    /**
     * ✅ CartItem DTO dönüşümü
     */
    private CartItemDTO convertItemToDTO(CartItem item) {
        return CartItemDTO.builder()
                .id(item.getId())
                .cartId(item.getCart().getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImage(item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0))
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    /**
     * 🔴 Redis cache'i temizle
     */
    private void invalidateCartCache(Long userId) {
        String cacheKey = CART_CACHE_PREFIX + userId;
        redisTemplate.delete(cacheKey);
        log.info("🧹 Redis cache temizlendi - Key: {}", cacheKey);
    }
}