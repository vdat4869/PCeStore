package com.project.inventory.service;

import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.dto.InventoryResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
     * Trừ kho trực tiếp.
     */
    InventoryResponse decreaseStock(InventoryRequest request);

    /**
     * Hoàn lại số lượng vào kho.
     */
    InventoryResponse increaseStock(InventoryRequest request);

    /**
     * Giữ hàng tạm thời (Tăng reserved).
     */
    InventoryResponse reserveStock(InventoryRequest request);

    /**
     * Xác nhận đơn hàng (Trừ quantity và trừ reserved).
     */
    InventoryResponse confirmStock(InventoryRequest request);

    /**
     * Huỷ giữ hàng (Trừ reserved).
     */
    InventoryResponse cancelReservation(InventoryRequest request);

    /**
     * Lấy lịch sử biến động kho của sản phẩm.
     */
    Page<com.project.inventory.entity.InventoryHistory> getHistory(Long productId, Pageable pageable);
}

