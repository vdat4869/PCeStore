package com.project.user.entity;

import com.project.auth.entity.User;
import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "user_profiles")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class UserProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ 1-1 với Entity gốc User
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    public UserProfile() {
    }

    public UserProfile(User user, String fullName, String phone, String avatarUrl) {
        this.user = user;
        this.fullName = fullName;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
    }
}
