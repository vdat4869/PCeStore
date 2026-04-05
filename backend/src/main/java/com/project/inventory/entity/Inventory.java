package com.project.inventory.entity;

import com.project.common.entity.BaseEntity;
import com.project.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

/**
 * Thực thể quản lý kho của một sản phẩm.
 * Tách biệt khỏi bảng Product để tối ưu việc cập nhật số lượng và khóa dòng (locking).
 */
@Entity
@Table(name = "inventories")
@SQLRestriction("is_deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Inventory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ 1-1 với sản phẩm. Mỗi sản phẩm có một bản ghi kho duy nhất.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    // Tổng số lượng hàng vật lý đang có trong kho.
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer quantity;

    // Số lượng đang được giữ (ví dụ: khách đã bỏ giỏ hàng hoặc đang thanh toán).
    // Available = quantity - reserved.
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer reserved;
}

