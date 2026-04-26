package com.ecommerce.ai.application;

import com.ecommerce.ai.adapters.out.claude.ClaudeApiClient;
import com.ecommerce.ai.domain.SearchRequest;
import com.ecommerce.ai.ports.in.SearchUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService implements SearchUseCase {

    private final ClaudeApiClient claudeApiClient;

    private static final String SYSTEM_PROMPT = """
        You are an intelligent product search engine for an e-commerce platform.
        Interpret the user's natural language search query and match it to
        relevant products from the available catalog.
        Return results as a JSON array with product matches and relevance scores.
        Consider synonyms, related terms, and user intent.
        """;

    @Override
    public String search(SearchRequest request) {
        String userMessage = String.format("""
            Search Query: %s
            Available Products: %s
            
            Find the most relevant products matching this search query.
            """,
                request.getNaturalLanguageQuery(),
                request.getAvailableProducts()
        );

        log.info("Processing AI search query: {}", request.getNaturalLanguageQuery());
        return claudeApiClient.sendMessage(SYSTEM_PROMPT, userMessage);
    }
}