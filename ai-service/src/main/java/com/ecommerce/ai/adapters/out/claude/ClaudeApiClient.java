package com.ecommerce.ai.adapters.out.claude;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ClaudeApiClient {

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.api.model:claude-3-5-sonnet-20241022}")
    private String model;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    private static final String CLAUDE_API_URL = "https://api.anthropic.com";

    public String sendMessage(String systemPrompt, String userMessage) {
        try {
            WebClient webClient = webClientBuilder
                    .baseUrl(CLAUDE_API_URL)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .defaultHeader("x-api-key", apiKey)
                    .defaultHeader("anthropic-version", "2023-06-01")
                    .build();

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "max_tokens", 1024,
                    "system", systemPrompt,
                    "messages", List.of(
                            Map.of("role", "user", "content", userMessage)
                    )
            );

            String response = webClient.post()
                    .uri("/v1/messages")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode jsonResponse = objectMapper.readTree(response);
            return jsonResponse
                    .path("content")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            log.error("Error calling Claude API: {}", e.getMessage());
            throw new RuntimeException("Failed to call Claude API", e);
        }
    }
}