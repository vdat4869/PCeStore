package com.project.notification.dto;

import com.project.notification.entity.NotificationStatus;
import com.project.notification.entity.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {
    private final Long id;
    private final NotificationType type;
    private final String content;
    private final NotificationStatus status;
    private final LocalDateTime createdAt;

    public NotificationResponse(Long id, NotificationType type, String content, NotificationStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.content = content;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public NotificationType getType() { return type; }
    public String getContent() { return content; }
    public NotificationStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
