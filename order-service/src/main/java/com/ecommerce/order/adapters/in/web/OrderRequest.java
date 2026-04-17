package com.ecommerce.order.adapters.in.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        @NotBlank
        private String productId;
        @NotBlank
        private String productName;
        private Integer quantity;
        private BigDecimal price;
    }
}