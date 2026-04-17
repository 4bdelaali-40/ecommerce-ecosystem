package com.ecommerce.inventory.application;

import com.ecommerce.inventory.domain.Inventory;
import com.ecommerce.inventory.ports.in.CheckInventoryUseCase;
import com.ecommerce.inventory.ports.in.UpdateInventoryUseCase;
import com.ecommerce.inventory.ports.out.InventoryRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService implements CheckInventoryUseCase, UpdateInventoryUseCase {

    private final InventoryRepositoryPort inventoryRepositoryPort;

    @Override
    public Inventory getInventoryByProductId(String productId) {
        return inventoryRepositoryPort.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException(
                        "Inventory not found for product: " + productId));
    }

    @Override
    public boolean isAvailable(String productId, int quantity) {
        return inventoryRepositoryPort.findByProductId(productId)
                .map(inv -> inv.isAvailable(quantity))
                .orElse(false);
    }

    @Override
    @Transactional
    public Inventory addStock(String productId, int quantity) {
        Inventory inventory = getInventoryByProductId(productId);
        inventory.addStock(quantity);
        log.info("Added {} units to product: {}", quantity, productId);
        return inventoryRepositoryPort.save(inventory);
    }

    @Override
    @Transactional
    public Inventory reserveStock(String productId, int quantity) {
        Inventory inventory = getInventoryByProductId(productId);
        inventory.reserve(quantity);
        log.info("Reserved {} units for product: {}", quantity, productId);
        return inventoryRepositoryPort.save(inventory);
    }

    @Override
    @Transactional
    public Inventory releaseStock(String productId, int quantity) {
        Inventory inventory = getInventoryByProductId(productId);
        inventory.release(quantity);
        log.info("Released {} units for product: {}", quantity, productId);
        return inventoryRepositoryPort.save(inventory);
    }

    @Override
    @Transactional
    public Inventory createInventory(String productId, int initialQuantity) {
        Inventory inventory = Inventory.builder()
                .productId(productId)
                .quantity(initialQuantity)
                .reservedQuantity(0)
                .build();
        log.info("Created inventory for product: {} with {} units",
                productId, initialQuantity);
        return inventoryRepositoryPort.save(inventory);
    }
}