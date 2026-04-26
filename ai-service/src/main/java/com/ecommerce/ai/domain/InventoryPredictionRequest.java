package com.ecommerce.ai.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryPredictionRequest {
    private String productId;
    private String productName;
    private int currentStock;
    private List<Integer> salesHistory;
    private String category;
}