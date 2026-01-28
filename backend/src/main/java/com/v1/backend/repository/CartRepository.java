package com.v1.backend.repository;

import com.v1.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);

    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId AND c.active = true")
    Optional<Cart> findActiveCartByUserId(@Param("userId") Long userId);

    boolean existsByUserIdAndActiveTrue(Long userId);
}