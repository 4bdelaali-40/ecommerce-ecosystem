package com.ecommerce.product.adapters.in.web;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class ProductRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive")
    private BigDecimal price;

    @NotBlank(message = "Category is required")
    private String category;

    @Min(value = 0, message = "Stock quantity must be non-negative")
    private Integer stockQuantity;

    private Map<String, Object> attributes;
}