package com.ecommerce.product.ports.out;

import com.ecommerce.product.domain.Product;

import java.util.Optional;

public interface ProductCachePort {
    void put(String key, Product product);
    Optional<Product> get(String key);
    void evict(String key);
}