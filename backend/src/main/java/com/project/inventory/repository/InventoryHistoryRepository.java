package com.project.inventory.repository;

import com.project.inventory.entity.InventoryHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository quản lý lịch sử biến động kho.
 */
@Repository
public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {
    
    /**
     * Tìm kiếm lịch sử kho theo Product ID (Phân trang).
     */
    Page<InventoryHistory> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
}
