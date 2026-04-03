package com.project.inventory.repository;

import com.project.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Repository quản lý các thao tác Database liên quan đến tồn kho.
 */
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Tìm kiếm thông tin kho thông thường dựa trên Product ID.
    Optional<Inventory> findByProductId(Long productId);

    /**
     * Tìm kiếm thông tin kho và áp dụng PESSIMISTIC_WRITE lock.
     * Lock này ngăn chặn các transaction khác đọc/ghi vào dòng này cho đến khi transaction hiện tại kết thúc.
     * Đây là cơ chế then chốt để chống bán vượt mức (overselling).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId")
    Optional<Inventory> findByProductIdWithLock(@Param("productId") Long productId);
}

