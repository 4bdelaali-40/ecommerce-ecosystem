package com.ecommerce.ai.ports.in;

import com.ecommerce.ai.domain.RecommendationRequest;

public interface RecommendationUseCase {
    String getRecommendations(RecommendationRequest request);
}