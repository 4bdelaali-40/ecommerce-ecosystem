package com.ecommerce.notification.service;

import com.ecommerce.notification.domain.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class NotificationService {

    public void sendOrderConfirmation(String userId, Long orderId, String totalAmount) {
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .recipient(userId)
                .subject("Order Confirmation - #" + orderId)
                .message(String.format(
                        "Dear customer, your order #%d has been confirmed. " +
                                "Total amount: %s. Thank you for shopping with us!",
                        orderId, totalAmount
                ))
                .type(Notification.NotificationType.ORDER_CONFIRMATION)
                .sentAt(LocalDateTime.now())
                .build();

        sendEmail(notification);
    }

    public void sendOrderCancellation(String userId, Long orderId) {
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .recipient(userId)
                .subject("Order Cancelled - #" + orderId)
                .message(String.format(
                        "Dear customer, your order #%d has been cancelled. " +
                                "If you have any questions, please contact support.",
                        orderId
                ))
                .type(Notification.NotificationType.ORDER_CANCELLED)
                .sentAt(LocalDateTime.now())
                .build();

        sendEmail(notification);
    }

    private void sendEmail(Notification notification) {
        // Simulated email sending - in production use JavaMailSender
        log.info("===== EMAIL NOTIFICATION =====");
        log.info("TO      : {}", notification.getRecipient());
        log.info("SUBJECT : {}", notification.getSubject());
        log.info("MESSAGE : {}", notification.getMessage());
        log.info("SENT AT : {}", notification.getSentAt());
        log.info("==============================");
    }
}