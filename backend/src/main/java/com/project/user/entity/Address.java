package com.project.user.entity;

import com.project.auth.entity.User;
import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "addresses")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class Address extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nhiều address ứng với 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String district;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    public Address() {
    }

    public Address(User user, String street, String city, String district, Boolean isDefault) {
        this.user = user;
        this.street = street;
        this.city = city;
        this.district = district;
        this.isDefault = isDefault;
    }
}
