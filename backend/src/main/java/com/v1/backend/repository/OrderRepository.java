package com.v1.backend.repository;

import com.v1.backend.model.Order;
import com.v1.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Sipariş numarasına göre bulur
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Kullanıcıya ait siparişleri bulur
     */
    Page<Order> findByUser(User user, Pageable pageable);

    /**
     * Kullanıcıya ait siparişleri duruma göre filtreler
     */
    Page<Order> findByUserAndStatus(User user, Order.OrderStatus status, Pageable pageable);

    /**
     * Belirli bir tarihten sonra oluşturulan siparişleri bulur
     */
    List<Order> findByCreatedAtAfter(LocalDateTime dateTime);

    /**
     * Belirli durumda olan siparişleri bulur
     */
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    /**
     * Ödeme durumuna göre siparişleri bulur
     */
    Page<Order> findByPaymentStatus(Order.PaymentStatus paymentStatus, Pageable pageable);
}