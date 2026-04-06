package com.project.user.entity;

import com.project.auth.entity.User;
import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_change_tokens")
@Getter
@Setter
public class EmailChangeToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "new_email", nullable = false)
    private String newEmail;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    public EmailChangeToken() {
    }

    public EmailChangeToken(User user, String newEmail, String token, LocalDateTime expiryDate) {
        this.user = user;
        this.newEmail = newEmail;
        this.token = token;
        this.expiryDate = expiryDate;
    }
}
