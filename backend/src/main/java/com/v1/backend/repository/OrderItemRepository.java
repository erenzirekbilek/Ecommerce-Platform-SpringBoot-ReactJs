package com.v1.backend.repository;

import com.v1.backend.model.Order;
import com.v1.backend.model.OrderItem;
import com.v1.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Siparişe ait tüm ürünleri bulur
     */
    List<OrderItem> findByOrder(Order order);

    /**
     * Sipariş ve ürüne göre item bulur
     */
    Optional<OrderItem> findByOrderAndProduct(Order order, Product product);

    /**
     * Ürüne ait tüm order item'leri bulur
     */
    List<OrderItem> findByProduct(Product product);
}