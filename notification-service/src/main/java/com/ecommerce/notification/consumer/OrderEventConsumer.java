package com.ecommerce.notification.consumer;

import com.ecommerce.notification.service.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-placed", groupId = "notification-group")
    public void handleOrderPlaced(String message) {
        try {
            log.info("Received order-placed event: {}", message);
            JsonNode order = objectMapper.readTree(message);

            String userId = order.get("userId").asText();
            Long orderId = order.get("id").asLong();
            String totalAmount = order.get("totalAmount").asText();

            notificationService.sendOrderConfirmation(userId, orderId, totalAmount);

        } catch (Exception e) {
            log.error("Failed to process order-placed event", e);
        }
    }
}