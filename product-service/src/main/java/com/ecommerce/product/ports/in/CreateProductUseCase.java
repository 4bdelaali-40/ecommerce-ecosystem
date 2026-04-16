package com.ecommerce.product.ports.in;

import com.ecommerce.product.domain.Product;

public interface CreateProductUseCase {
    Product createProduct(Product product);
}