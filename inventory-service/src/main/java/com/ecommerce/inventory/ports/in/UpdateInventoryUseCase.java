package com.ecommerce.inventory.ports.in;

import com.ecommerce.inventory.domain.Inventory;

public interface UpdateInventoryUseCase {
    Inventory addStock(String productId, int quantity);
    Inventory reserveStock(String productId, int quantity);
    Inventory releaseStock(String productId, int quantity);
    Inventory createInventory(String productId, int initialQuantity);
}