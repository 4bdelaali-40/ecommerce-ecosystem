package com.ecommerce.product.adapters.out.cache;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.ports.out.ProductCachePort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProductCacheAdapter implements ProductCachePort {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CACHE_PREFIX = "product:";
    private static final Duration TTL = Duration.ofMinutes(30);

    @Override
    public void put(String key, Product product) {
        redisTemplate.opsForValue().set(CACHE_PREFIX + key, product, TTL);
    }

    @Override
    public Optional<Product> get(String key) {
        Object cached = redisTemplate.opsForValue().get(CACHE_PREFIX + key);
        if (cached instanceof Product product) {
            return Optional.of(product);
        }
        return Optional.empty();
    }

    @Override
    public void evict(String key) {
        redisTemplate.delete(CACHE_PREFIX + key);
    }
}