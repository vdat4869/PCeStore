package com.project.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả về thông tin chi tiết về trạng thái lưu kho của sản phẩm.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    // ID của bản ghi inventory.
    private Long id;

    // ID và tên sản phẩm tương ứng.
    private Long productId;
    private String productName;

    // Tổng số lượng hàng vật lý hiện có.
    private Integer quantity;

    // Số lượng đang được tạm giữ.
    private Integer reserved;

    // Số lượng thực tế có thể bán (Available = Quantity - Reserved).
    private Integer availableStock;

    // Thời điểm cập nhật kho gần nhất.
    private LocalDateTime updatedAt;
}

