package com.ecommerce.product.ports.out;

import com.ecommerce.product.domain.Product;

import java.util.List;
import java.util.Optional;

public interface ProductRepository {
    Product save(Product product);
    Optional<Product> findById(String id);
    List<Product> findAll();
    List<Product> findByCategory(String category);
    void deleteById(String id);
    boolean existsById(String id);
}