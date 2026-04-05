package com.project.inventory.service;

import com.project.inventory.entity.Inventory;
import com.project.inventory.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Job tự động kiểm tra và sửa lỗi logic dữ liệu tồn kho.
 * Chạy định kỳ để đảm bảo tính toàn vẹn dữ liệu.
 */
@Service
public class InventorySyncJob {

    private static final Logger log = LoggerFactory.getLogger(InventorySyncJob.class);

    private final InventoryRepository inventoryRepository;

    public InventorySyncJob(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Quét toàn bộ bảng inventories để tìm các bản ghi có reserved > quantity 
     * hoặc reserved < 0 (Lỗi logic do race condition hoặc lỗi code cũ).
     * Chạy mỗi giờ một lần.
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void auditAndFixInventoryConsistency() {
        log.info("Bắt đầu Job Audit Inventory Consistency...");

        List<Inventory> allInventories = inventoryRepository.findAll();
        int fixCount = 0;

        for (Inventory inv : allInventories) {
            boolean changed = false;

            // Lỗi 1: Reserved âm
            if (inv.getReserved() < 0) {
                log.warn("Phát hiện reserved âm cho Product ID: {}. Đang reset về 0.", inv.getProduct().getId());
                inv.setReserved(0);
                changed = true;
            }

            // Lỗi 2: Reserved vượt quá tổng số hàng hiện có
            if (inv.getReserved() > inv.getQuantity()) {
                log.error("Lỗi nghiêm trọng: Reserved ({}) > Quantity ({}) tại Product ID: {}. Đang cân bằng lại.", 
                          inv.getReserved(), inv.getQuantity(), inv.getProduct().getId());
                inv.setReserved(inv.getQuantity());
                changed = true;
            }

            if (changed) {
                inventoryRepository.save(inv);
                fixCount++;
            }
        }

        if (fixCount > 0) {
            log.info("Hoàn tất Job Audit. Đã sửa lỗi cho {} bản ghi.", fixCount);
        } else {
            log.info("Hoàn tất Job Audit. Không phát hiện lỗi logic dữ liệu.");
        }
    }
}
