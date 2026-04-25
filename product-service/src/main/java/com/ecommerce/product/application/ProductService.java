package com.ecommerce.product.application;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.ports.in.CreateProductUseCase;
import com.ecommerce.product.ports.in.GetProductUseCase;
import com.ecommerce.product.ports.in.UpdateProductUseCase;
import com.ecommerce.product.ports.out.ProductCachePort;
import com.ecommerce.product.ports.out.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService implements
        CreateProductUseCase,
        GetProductUseCase,
        UpdateProductUseCase {

    private final ProductRepository productRepository;
    private final ProductCachePort productCachePort;

    @Override
    public Product createProduct(Product product) {
        product.setActive(true);
        Product saved = productRepository.save(product);
        log.info("Product created with id: {}", saved.getId());
        return saved;
    }

    @Override
    public Product getProductById(String id) {
        return productCachePort.get(id)
                .orElseGet(() -> {
                    Product product = productRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Product not found: " + id));
                    productCachePort.put(id, product);
                    log.info("Product {} fetched from DB and cached", id);
                    return product;
                });
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    @Override
    public Product updateProduct(String id, Product product) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found: " + id);
        }
        product.setId(id);
        Product updated = productRepository.save(product);
        productCachePort.evict(id);
        log.info("Product {} updated and cache evicted", id);
        return updated;
    }

    @Override
    public void deleteProduct(String id) {
        productRepository.deleteById(id);
        productCachePort.evict(id);
        log.info("Product {} deleted and cache evicted", id);
    }
}