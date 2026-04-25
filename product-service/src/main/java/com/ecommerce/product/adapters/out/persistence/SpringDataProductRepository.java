package com.ecommerce.product.adapters.out.persistence;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SpringDataProductRepository
        extends MongoRepository<ProductDocument, String> {
    List<ProductDocument> findByCategory(String category);
}