package com.ecommerce.product.ports.in;

import com.ecommerce.product.domain.Product;

public interface UpdateProductUseCase {
    Product updateProduct(String id, Product product);
    void deleteProduct(String id);
}