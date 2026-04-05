package com.project.notification.entity;

import com.project.auth.entity.User;
import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_user", columnList = "user_id"),
    @Index(name = "idx_notification_status", columnList = "status"),
    @Index(name = "idx_notification_created", columnList = "created_at")
})
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status = NotificationStatus.PENDING;

    private LocalDateTime sentAt;

    public Notification() {}

    public Notification(User user, NotificationType type, String content) {
        this.user = user;
        this.type = type;
        this.content = content;
    }
}
