package com.project.inventory.service;

import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.dto.InventoryResponse;

/**
 * Interface định nghĩa các nghiệp vụ quản lý tồn kho.
 */
public interface InventoryService {
    
    /**
     * Lấy trạng thái kho hiện tại của một sản phẩm.
     */
    InventoryResponse getStock(Long productId);

    /**
     * Cập nhật (set) số lượng tồn kho mới. Thường dùng cho ADMIN.
     */
    InventoryResponse updateStock(InventoryRequest request);

    /**
     * Trừ kho khi có đơn hàng mới. Có cơ chế kiểm tra và khóa dòng để tránh bán vượt mức.
     */
    InventoryResponse decreaseStock(InventoryRequest request);

    /**
     * Hoàn lại số lượng vào kho khi đơn hàng bị hủy.
     */
    InventoryResponse increaseStock(InventoryRequest request);
}

