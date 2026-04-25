package com.ecommerce.inventory.adapters.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpringDataInventoryRepository
        extends JpaRepository<InventoryEntity, Long> {
    Optional<InventoryEntity> findByProductId(String productId);
}