package com.ecommerce.inventory.ports.out;

import com.ecommerce.inventory.domain.Inventory;

import java.util.Optional;

public interface InventoryRepositoryPort {
    Inventory save(Inventory inventory);
    Optional<Inventory> findByProductId(String productId);
}