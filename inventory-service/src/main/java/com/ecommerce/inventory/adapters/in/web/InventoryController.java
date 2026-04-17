package com.ecommerce.inventory.adapters.in.web;

import com.ecommerce.inventory.domain.Inventory;
import com.ecommerce.inventory.ports.in.CheckInventoryUseCase;
import com.ecommerce.inventory.ports.in.UpdateInventoryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final CheckInventoryUseCase checkInventoryUseCase;
    private final UpdateInventoryUseCase updateInventoryUseCase;

    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getInventory(@PathVariable String productId) {
        return ResponseEntity.ok(checkInventoryUseCase.getInventoryByProductId(productId));
    }

    @GetMapping("/{productId}/available")
    public ResponseEntity<Boolean> isAvailable(
            @PathVariable String productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(checkInventoryUseCase.isAvailable(productId, quantity));
    }

    @PostMapping("/{productId}/create")
    public ResponseEntity<Inventory> createInventory(
            @PathVariable String productId,
            @RequestParam int initialQuantity) {
        return ResponseEntity.ok(
                updateInventoryUseCase.createInventory(productId, initialQuantity));
    }

    @PutMapping("/{productId}/add")
    public ResponseEntity<Inventory> addStock(
            @PathVariable String productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(updateInventoryUseCase.addStock(productId, quantity));
    }

    @PutMapping("/{productId}/reserve")
    public ResponseEntity<Inventory> reserveStock(
            @PathVariable String productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(updateInventoryUseCase.reserveStock(productId, quantity));
    }

    @PutMapping("/{productId}/release")
    public ResponseEntity<Inventory> releaseStock(
            @PathVariable String productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(updateInventoryUseCase.releaseStock(productId, quantity));
    }
}