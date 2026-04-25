package com.ecommerce.order.adapters.out.messaging;

import com.ecommerce.order.adapters.out.persistence.OutboxEvent;
import com.ecommerce.order.adapters.out.persistence.OutboxEventRepository;
import com.ecommerce.order.domain.Order;
import com.ecommerce.order.ports.out.OrderEventPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaOrderEventAdapter implements OrderEventPort {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String TOPIC = "order-placed";

    @Override
    @Transactional
    public void publishOrderPlaced(Order order) {
        try {
            String payload = objectMapper.writeValueAsString(order);
            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType("Order")
                    .aggregateId(order.getId().toString())
                    .eventType("ORDER_PLACED")
                    .payload(payload)
                    .published(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            outboxEventRepository.save(event);
            log.info("Outbox event saved for order: {}", order.getId());
        } catch (Exception e) {
            log.error("Failed to save outbox event", e);
            throw new RuntimeException("Failed to save outbox event", e);
        }
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processOutboxEvents() {
        List<OutboxEvent> unpublished = outboxEventRepository.findByPublishedFalse();
        for (OutboxEvent event : unpublished) {
            try {
                kafkaTemplate.send(TOPIC, event.getAggregateId(), event.getPayload());
                event.setPublished(true);
                outboxEventRepository.save(event);
                log.info("Outbox event published to Kafka: {}", event.getId());
            } catch (Exception e) {
                log.error("Failed to publish outbox event: {}", event.getId(), e);
            }
        }
    }
}