package com.ecommerce.order.ports.in;

import com.ecommerce.order.domain.Order;

public interface PlaceOrderUseCase {
    Order placeOrder(Order order);
}