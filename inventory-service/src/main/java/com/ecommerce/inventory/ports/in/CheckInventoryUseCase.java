package com.ecommerce.inventory.ports.in;

import com.ecommerce.inventory.domain.Inventory;

public interface CheckInventoryUseCase {
    Inventory getInventoryByProductId(String productId);
    boolean isAvailable(String productId, int quantity);
}