package com.project.product.entity;

import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "products")
@SQLRestriction("is_deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String brand;

    // Liên kết 1-1 ngược lại với Inventory để lấy thông tin tồn kho.
    // Dùng mappedBy vì 'product' đã được định nghĩa là chủ sở hữu (Owner) bên phía Inventory.
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private com.project.inventory.entity.Inventory inventory;

    private String imageUrl;
}
