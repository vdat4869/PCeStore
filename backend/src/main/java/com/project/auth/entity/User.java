package com.project.auth.entity;

import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone", unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider")
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "failed_attempts", nullable = false, columnDefinition = "integer default 0")
    private int failedAttempts = 0;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @Column(name = "account_non_locked", nullable = false, columnDefinition = "boolean default true")
    private boolean accountNonLocked = true;

    // Default constructor (bắt buộc bởi JPA)
    public User() {
    }

    // Constructor với tham số
    public User(String email, String password, UserRole role, UserStatus status) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
        this.authProvider = AuthProvider.LOCAL;
        this.failedAttempts = 0;
        this.accountNonLocked = true;
    }
}
