package com.v1.backend.repository;

import com.v1.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    List<CartItem> findByCartId(Long cartId);

    long countByCartId(Long cartId);

    void deleteByCartIdAndProductId(Long cartId, Long productId);

    void deleteByCartId(Long cartId);

    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.product.id = :productId AND ci.cart.active = true")
    long countByProductIdInActiveCarts(@Param("productId") Long productId);
}