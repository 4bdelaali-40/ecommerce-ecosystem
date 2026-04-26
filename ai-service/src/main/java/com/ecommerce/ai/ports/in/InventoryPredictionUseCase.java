package com.ecommerce.ai.ports.in;

import com.ecommerce.ai.domain.InventoryPredictionRequest;

public interface InventoryPredictionUseCase {
    String predictInventory(InventoryPredictionRequest request);
}