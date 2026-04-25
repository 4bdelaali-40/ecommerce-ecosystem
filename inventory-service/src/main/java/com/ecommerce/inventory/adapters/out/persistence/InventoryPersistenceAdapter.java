package com.ecommerce.inventory.adapters.out.persistence;

import com.ecommerce.inventory.domain.Inventory;
import com.ecommerce.inventory.ports.out.InventoryRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class InventoryPersistenceAdapter implements InventoryRepositoryPort {

    private final SpringDataInventoryRepository repository;

    @Override
    public Inventory save(Inventory inventory) {
        InventoryEntity entity = toEntity(inventory);
        return toDomain(repository.save(entity));
    }

    @Override
    public Optional<Inventory> findByProductId(String productId) {
        return repository.findByProductId(productId).map(this::toDomain);
    }

    private InventoryEntity toEntity(Inventory inventory) {
        return InventoryEntity.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .quantity(inventory.getQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .build();
    }

    private Inventory toDomain(InventoryEntity entity) {
        return Inventory.builder()
                .id(entity.getId())
                .productId(entity.getProductId())
                .quantity(entity.getQuantity())
                .reservedQuantity(entity.getReservedQuantity())
                .build();
    }
}