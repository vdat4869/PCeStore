package com.project.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_alerts")
@Getter
@Setter
public class SystemAlert extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String module;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SystemLogSeverity severity;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "is_resolved", nullable = false)
    private boolean resolved = false;

    private LocalDateTime resolvedAt;

    public SystemAlert() {
    }

    public SystemAlert(String module, SystemLogSeverity severity, String message, String details) {
        this.module = module;
        this.severity = severity;
        this.message = message;
        this.details = details;
    }
}
