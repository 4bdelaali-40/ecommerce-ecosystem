package com.ecommerce.order.ports.out;

import com.ecommerce.order.domain.Order;

public interface OrderEventPort {
    void publishOrderPlaced(Order order);
}