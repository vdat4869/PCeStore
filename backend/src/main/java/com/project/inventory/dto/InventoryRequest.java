package com.project.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO yêu cầu các thao tác về kho (Cập nhật, Trừ, Hoàn).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequest {

    // ID của sản phẩm cần thao tác kho.
    @NotNull(message = "Product ID is required")
    private Long productId;

    // Số lượng hàng cần thay đổi (phải ít nhất là 1).
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}

