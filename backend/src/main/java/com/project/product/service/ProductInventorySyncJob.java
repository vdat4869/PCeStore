package com.project.product.service;

import com.project.inventory.entity.Inventory;
import com.project.inventory.repository.InventoryRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Tác vụ tự động đồng bộ (Auto-healing) giữa Product và Inventory.
 * Đảm bảo mọi sản phẩm đều có một bản ghi kho (Inventory Record) tương ứng.
 */
@Service
public class ProductInventorySyncJob {

    private static final Logger log = LoggerFactory.getLogger(ProductInventorySyncJob.class);

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public ProductInventorySyncJob(ProductRepository productRepository, InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Tác vụ đồng bộ (Auto-healing/Backfill) giữa Product và Inventory.
     * Đã bị loại bỏ khỏi luồng chạy tự động (@Scheduled) để tránh Conflict và cấp quyền cho Event-Driven.
     * Chỉ gọi thủ công (manual trigger) khi cần repair data.
     */
    @Transactional
    public void syncMissingInventories() {
        log.info("Bắt đầu Job Auto-healing (Manual Backfill): Quét các sản phầm thiếu bản ghi tồn kho...");

        // Tìm tất cả sản phẩm
        List<Product> allProducts = productRepository.findAll();
        int createdCount = 0;

        for (Product product : allProducts) {
            if (!inventoryRepository.existsByProductId(product.getId())) {
                log.warn("Phát hiện sản phẩm thiếu kho [ID: {}, Tên: {}]. Đang tự động tạo...", 
                         product.getId(), product.getName());

                Inventory newInventory = new Inventory();
                newInventory.setProductId(product.getId());
                newInventory.setQuantity(0);
                newInventory.setReserved(0);
                
                inventoryRepository.save(newInventory);
                createdCount++;
            }
        }

        if (createdCount > 0) {
            log.info("Hoàn tất Job Auto-healing. Đã tự động tạo {} bản ghi kho mới.", createdCount);
        } else {
            log.info("Hoàn tất Job Auto-healing. Dữ liệu đã đồng bộ, không phát hiện lỗi.");
        }
    }
}
