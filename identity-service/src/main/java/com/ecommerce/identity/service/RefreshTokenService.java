package com.ecommerce.identity.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final String BLACKLIST_PREFIX = "blacklist:";
    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);

    public String generateRefreshToken(String email) {
        String refreshToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + refreshToken,
                email,
                REFRESH_TOKEN_TTL
        );
        log.info("Refresh token generated for user: {}", email);
        return refreshToken;
    }

    public String getEmailFromRefreshToken(String refreshToken) {
        return redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + refreshToken);
    }

    public void deleteRefreshToken(String refreshToken) {
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + refreshToken);
    }

    public void blacklistAccessToken(String accessToken, long expirationMs) {
        redisTemplate.opsForValue().set(
                BLACKLIST_PREFIX + accessToken,
                "blacklisted",
                Duration.ofMillis(expirationMs)
        );
        log.info("Access token blacklisted");
    }

    public boolean isTokenBlacklisted(String accessToken) {
        return Boolean.TRUE.equals(
                redisTemplate.hasKey(BLACKLIST_PREFIX + accessToken)
        );
    }
}