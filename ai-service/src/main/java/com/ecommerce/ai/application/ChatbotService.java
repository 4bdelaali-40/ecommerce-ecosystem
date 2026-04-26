package com.ecommerce.ai.application;

import com.ecommerce.ai.adapters.out.claude.ClaudeApiClient;
import com.ecommerce.ai.domain.ChatMessage;
import com.ecommerce.ai.ports.in.ChatbotUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService implements ChatbotUseCase {

    private final ClaudeApiClient claudeApiClient;

    private static final String SYSTEM_PROMPT = """
        You are a helpful customer support assistant for an e-commerce platform.
        You help customers with questions about their orders, products, returns,
        and general shopping assistance. Be friendly, professional, and concise.
        If you don't have specific order information, ask the user for their order ID.
        """;

    @Override
    public String chat(ChatMessage message) {
        String userMessage = String.format("""
            User ID: %s
            Order Context: %s
            User Message: %s
            """,
                message.getUserId(),
                message.getOrderContext() != null ? message.getOrderContext() : "No specific order context",
                message.getMessage()
        );

        log.info("Processing chatbot message for user: {}", message.getUserId());
        return claudeApiClient.sendMessage(SYSTEM_PROMPT, userMessage);
    }
}