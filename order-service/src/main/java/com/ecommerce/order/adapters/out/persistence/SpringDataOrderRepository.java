package com.ecommerce.order.adapters.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataOrderRepository
        extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUserId(String userId);
}