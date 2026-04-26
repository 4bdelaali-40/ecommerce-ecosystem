package com.ecommerce.ai.application;

import com.ecommerce.ai.adapters.out.claude.ClaudeApiClient;
import com.ecommerce.ai.domain.InventoryPredictionRequest;
import com.ecommerce.ai.ports.in.InventoryPredictionUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryPredictionService implements InventoryPredictionUseCase {

    private final ClaudeApiClient claudeApiClient;

    private static final String SYSTEM_PROMPT = """
        You are an intelligent inventory management AI for an e-commerce platform.
        Analyze sales history and current stock levels to predict:
        1. When the product will run out of stock
        2. Recommended reorder quantity
        3. Risk level: LOW, MEDIUM, or HIGH
        4. Suggested actions for inventory management
        Return your analysis as a structured JSON response.
        """;

    @Override
    public String predictInventory(InventoryPredictionRequest request) {
        String userMessage = String.format("""
            Product ID: %s
            Product Name: %s
            Category: %s
            Current Stock: %d units
            Sales History (last days): %s
            
            Analyze this inventory and provide predictions.
            """,
                request.getProductId(),
                request.getProductName(),
                request.getCategory(),
                request.getCurrentStock(),
                request.getSalesHistory()
        );

        log.info("Predicting inventory for product: {}", request.getProductId());
        return claudeApiClient.sendMessage(SYSTEM_PROMPT, userMessage);
    }
}