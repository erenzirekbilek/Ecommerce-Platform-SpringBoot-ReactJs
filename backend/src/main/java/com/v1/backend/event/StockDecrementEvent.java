package com.v1.backend.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Stok düşümü için event
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockDecrementEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long productId;
    private Integer quantity;
    private Long orderId;
    private String orderNumber;
    private LocalDateTime timestamp;
}