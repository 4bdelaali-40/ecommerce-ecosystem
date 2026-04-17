package com.ecommerce.inventory.adapters.in.messaging;

import com.ecommerce.inventory.ports.in.UpdateInventoryUseCase;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderPlacedConsumer {

    private final UpdateInventoryUseCase updateInventoryUseCase;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-placed", groupId = "inventory-group")
    public void handleOrderPlaced(String message) {
        try {
            JsonNode order = objectMapper.readTree(message);
            JsonNode items = order.get("items");

            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    String productId = item.get("productId").asText();
                    int quantity = item.get("quantity").asInt();
                    updateInventoryUseCase.reserveStock(productId, quantity);
                    log.info("Reserved {} units for product: {}", quantity, productId);
                }
            }
        } catch (Exception e) {
            log.error("Failed to process order-placed event", e);
        }
    }
}