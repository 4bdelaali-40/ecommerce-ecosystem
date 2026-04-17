package com.ecommerce.inventory.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    private Long id;
    private String productId;
    private Integer quantity;
    private Integer reservedQuantity;

    public boolean isAvailable(int requestedQuantity) {
        return (quantity - reservedQuantity) >= requestedQuantity;
    }

    public void reserve(int requestedQuantity) {
        if (!isAvailable(requestedQuantity)) {
            throw new IllegalStateException(
                    "Insufficient stock for product: " + productId
            );
        }
        this.reservedQuantity += requestedQuantity;
    }

    public void release(int quantity) {
        this.reservedQuantity = Math.max(0, this.reservedQuantity - quantity);
    }

    public void addStock(int quantity) {
        this.quantity += quantity;
    }

    public int getAvailableQuantity() {
        return quantity - reservedQuantity;
    }
}