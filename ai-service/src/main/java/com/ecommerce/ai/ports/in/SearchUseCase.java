package com.ecommerce.ai.ports.in;

import com.ecommerce.ai.domain.SearchRequest;

public interface SearchUseCase {
    String search(SearchRequest request);
}