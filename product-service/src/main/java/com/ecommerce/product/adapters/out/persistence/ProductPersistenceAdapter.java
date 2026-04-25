package com.ecommerce.product.adapters.out.persistence;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.ports.out.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductPersistenceAdapter implements ProductRepository {

    private final SpringDataProductRepository repository;

    @Override
    public Product save(Product product) {
        ProductDocument doc = toDocument(product);
        return toDomain(repository.save(doc));
    }

    @Override
    public Optional<Product> findById(String id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Product> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Product> findByCategory(String category) {
        return repository.findByCategory(category).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    @Override
    public boolean existsById(String id) {
        return repository.existsById(id);
    }

    private ProductDocument toDocument(Product p) {
        return ProductDocument.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .category(p.getCategory())
                .stockQuantity(p.getStockQuantity())
                .attributes(p.getAttributes())
                .active(p.isActive())
                .build();
    }

    private Product toDomain(ProductDocument doc) {
        return Product.builder()
                .id(doc.getId())
                .name(doc.getName())
                .description(doc.getDescription())
                .price(doc.getPrice())
                .category(doc.getCategory())
                .stockQuantity(doc.getStockQuantity())
                .attributes(doc.getAttributes())
                .active(doc.isActive())
                .build();
    }
}