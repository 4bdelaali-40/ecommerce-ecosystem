package com.ecommerce.order.ports.in;

import com.ecommerce.order.domain.Order;

import java.util.List;

public interface GetOrderUseCase {
    Order getOrderById(Long id);
    List<Order> getOrdersByUserId(String userId);
}