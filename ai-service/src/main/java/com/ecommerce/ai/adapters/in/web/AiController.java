package com.ecommerce.ai.adapters.in.web;

import com.ecommerce.ai.domain.*;
import com.ecommerce.ai.ports.in.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Service", description = "AI-powered features for e-commerce")
public class AiController {

    private final RecommendationUseCase recommendationUseCase;
    private final ChatbotUseCase chatbotUseCase;
    private final SearchUseCase searchUseCase;
    private final InventoryPredictionUseCase inventoryPredictionUseCase;

    @PostMapping("/recommendations")
    @Operation(summary = "Get AI product recommendations for a user")
    public ResponseEntity<String> getRecommendations(
            @RequestBody RecommendationRequest request) {
        return ResponseEntity.ok(recommendationUseCase.getRecommendations(request));
    }

    @PostMapping("/chat")
    @Operation(summary = "Chat with AI customer support")
    public ResponseEntity<String> chat(@RequestBody ChatMessage message) {
        return ResponseEntity.ok(chatbotUseCase.chat(message));
    }

    @PostMapping("/search")
    @Operation(summary = "AI-powered natural language product search")
    public ResponseEntity<String> search(@RequestBody SearchRequest request) {
        return ResponseEntity.ok(searchUseCase.search(request));
    }

    @PostMapping("/inventory/predict")
    @Operation(summary = "Predict inventory levels and get reorder recommendations")
    public ResponseEntity<String> predictInventory(
            @RequestBody InventoryPredictionRequest request) {
        return ResponseEntity.ok(
                inventoryPredictionUseCase.predictInventory(request));
    }
}