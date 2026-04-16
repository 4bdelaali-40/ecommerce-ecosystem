package com.ecommerce.product.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private Integer stockQuantity;
    private Map<String, Object> attributes;
    private boolean active;

    // Business rule: discount cannot exceed 50%
    public BigDecimal applyDiscount(BigDecimal discountPercent) {
        if (discountPercent.compareTo(BigDecimal.valueOf(50)) > 0) {
            throw new IllegalArgumentException("Discount cannot exceed 50%");
        }
        BigDecimal discountAmount = price.multiply(discountPercent)
                .divide(BigDecimal.valueOf(100));
        return price.subtract(discountAmount);
    }

    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0;
    }
}