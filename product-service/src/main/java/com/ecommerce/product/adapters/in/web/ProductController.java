package com.ecommerce.product.adapters.in.web;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.ports.in.CreateProductUseCase;
import com.ecommerce.product.ports.in.GetProductUseCase;
import com.ecommerce.product.ports.in.UpdateProductUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final CreateProductUseCase createProductUseCase;
    private final GetProductUseCase getProductUseCase;
    private final UpdateProductUseCase updateProductUseCase;

    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .stockQuantity(request.getStockQuantity())
                .attributes(request.getAttributes())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(createProductUseCase.createProduct(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(getProductUseCase.getProductById(id));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(getProductUseCase.getAllProducts());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(getProductUseCase.getProductsByCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .stockQuantity(request.getStockQuantity())
                .attributes(request.getAttributes())
                .build();
        return ResponseEntity.ok(updateProductUseCase.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        updateProductUseCase.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}