package com.ecommerce.order.adapters.in.web;

import com.ecommerce.order.domain.Order;
import com.ecommerce.order.domain.OrderItem;
import com.ecommerce.order.ports.in.GetOrderUseCase;
import com.ecommerce.order.ports.in.PlaceOrderUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final PlaceOrderUseCase placeOrderUseCase;
    private final GetOrderUseCase getOrderUseCase;

    @PostMapping
    public ResponseEntity<Order> placeOrder(@Valid @RequestBody OrderRequest request) {
        List<OrderItem> items = request.getItems().stream()
                .map(item -> OrderItem.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        Order order = Order.builder()
                .userId(request.getUserId())
                .items(items)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(placeOrderUseCase.placeOrder(order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(getOrderUseCase.getOrderById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable String userId) {
        return ResponseEntity.ok(getOrderUseCase.getOrdersByUserId(userId));
    }
}