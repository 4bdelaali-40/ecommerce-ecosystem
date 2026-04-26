package com.ecommerce.ai.application;

import com.ecommerce.ai.adapters.out.claude.ClaudeApiClient;
import com.ecommerce.ai.domain.RecommendationRequest;
import com.ecommerce.ai.ports.in.RecommendationUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService implements RecommendationUseCase {

    private final ClaudeApiClient claudeApiClient;

    private static final String SYSTEM_PROMPT = """
        You are an intelligent e-commerce product recommendation engine.
        Based on the user's purchase history and available products,
        suggest relevant products they might be interested in.
        Be concise and provide 3-5 specific recommendations with brief reasons.
        Format your response as a JSON array of recommendations.
        """;

    @Override
    public String getRecommendations(RecommendationRequest request) {
        String userMessage = String.format("""
            User ID: %s
            Previously ordered products: %s
            Available categories: %s
            Preferred price range: %s
            
            Please recommend products for this user.
            """,
                request.getUserId(),
                request.getPreviousOrderedProducts(),
                request.getAvailableCategories(),
                request.getPreferredPriceRange()
        );

        log.info("Getting AI recommendations for user: {}", request.getUserId());
        return claudeApiClient.sendMessage(SYSTEM_PROMPT, userMessage);
    }
}