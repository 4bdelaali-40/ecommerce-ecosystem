package com.ecommerce.order.adapters.out.persistence;

import com.ecommerce.order.domain.Order;
import com.ecommerce.order.domain.OrderItem;
import com.ecommerce.order.ports.out.OrderRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderPersistenceAdapter implements OrderRepositoryPort {

    private final SpringDataOrderRepository repository;

    @Override
    public Order save(Order order) {
        OrderEntity entity = toEntity(order);
        if (entity.getItems() != null) {
            entity.getItems().forEach(item -> item.setOrder(entity));
        }
        return toDomain(repository.save(entity));
    }

    @Override
    public Optional<Order> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Order> findByUserId(String userId) {
        return repository.findByUserId(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private OrderEntity toEntity(Order order) {
        OrderEntity entity = OrderEntity.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();

        if (order.getItems() != null) {
            List<OrderItemEntity> items = order.getItems().stream()
                    .map(item -> OrderItemEntity.builder()
                            .id(item.getId())
                            .productId(item.getProductId())
                            .productName(item.getProductName())
                            .quantity(item.getQuantity())
                            .price(item.getPrice())
                            .build())
                    .collect(Collectors.toList());
            entity.setItems(items);
        }
        return entity;
    }

    private Order toDomain(OrderEntity entity) {
        List<OrderItem> items = entity.getItems() == null ? List.of() :
                entity.getItems().stream()
                        .map(item -> OrderItem.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .build())
                        .collect(Collectors.toList());

        return Order.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .items(items)
                .totalAmount(entity.getTotalAmount())
                .status(Order.OrderStatus.valueOf(entity.getStatus()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    @Override
    public List<Order> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
}