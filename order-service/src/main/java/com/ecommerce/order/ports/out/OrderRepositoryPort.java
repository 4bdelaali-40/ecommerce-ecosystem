package com.ecommerce.order.ports.out;

import com.ecommerce.order.domain.Order;
import java.util.List;
import java.util.Optional;

public interface OrderRepositoryPort {
    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findByUserId(String userId);
    List<Order> findAll();
}