package com.project.inventory.entity;

import com.project.product.entity.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Thực thể quản lý kho của một sản phẩm.
 * Tách biệt khỏi bảng Product để tối ưu việc cập nhật số lượng và khóa dòng (locking).
 */
@Entity
@Table(name = "inventories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

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

    // Tự động ghi lại thời điểm cập nhật kho cuối cùng.
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

