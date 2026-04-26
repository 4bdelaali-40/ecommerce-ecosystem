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
public class RecommendationRequest {
    private String userId;
    private List<String> previousOrderedProducts;
    private List<String> availableCategories;
    private String preferredPriceRange;
}