package com.ecommerce.ai.ports.in;

import com.ecommerce.ai.domain.ChatMessage;

public interface ChatbotUseCase {
    String chat(ChatMessage message);
}