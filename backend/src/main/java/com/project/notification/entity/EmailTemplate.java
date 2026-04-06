package com.project.notification.entity;

import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "email_templates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"type", "locale"})
})
@Getter
@Setter
public class EmailTemplate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 10)
    private String locale; // "vi", "en"

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // HTML content with placeholders like {{link}}

    public EmailTemplate() {}

    public EmailTemplate(NotificationType type, String locale, String subject, String content) {
        this.type = type;
        this.locale = locale;
        this.subject = subject;
        this.content = content;
    }
}
