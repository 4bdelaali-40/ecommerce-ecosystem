package com.ecommerce.order.application;

import com.ecommerce.order.domain.Order;
import com.ecommerce.order.ports.in.GetOrderUseCase;
import com.ecommerce.order.ports.in.PlaceOrderUseCase;
import com.ecommerce.order.ports.out.OrderEventPort;
import com.ecommerce.order.ports.out.OrderRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService implements PlaceOrderUseCase, GetOrderUseCase {

    private final OrderRepositoryPort orderRepositoryPort;
    private final OrderEventPort orderEventPort;

    @Override
    @Transactional
    public Order placeOrder(Order order) {
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.calculateTotal();

        Order saved = orderRepositoryPort.save(order);

        orderEventPort.publishOrderPlaced(saved);

        log.info("Order placed with id: {}", saved.getId());
        return saved;
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    @Override
    public List<Order> getOrdersByUserId(String userId) {
        return orderRepositoryPort.findByUserId(userId);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepositoryPort.findAll();
    }
}