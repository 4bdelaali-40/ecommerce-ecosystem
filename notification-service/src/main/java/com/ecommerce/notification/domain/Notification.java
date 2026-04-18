package com.ecommerce.notification.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    private String id;
    private String recipient;
    private String subject;
    private String message;
    private NotificationType type;
    private LocalDateTime sentAt;

    public enum NotificationType {
        ORDER_CONFIRMATION,
        ORDER_SHIPPED,
        ORDER_DELIVERED,
        ORDER_CANCELLED
    }
}