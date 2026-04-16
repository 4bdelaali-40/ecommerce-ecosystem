package com.ecommerce.product.ports.in;

import com.ecommerce.product.domain.Product;

import java.util.List;

public interface GetProductUseCase {
    Product getProductById(String id);
    List<Product> getAllProducts();
    List<Product> getProductsByCategory(String category);
}