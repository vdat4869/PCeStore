package com.project.product.service;

import com.project.inventory.entity.Inventory;
import com.project.inventory.repository.InventoryRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
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
     * Chạy định kỳ mỗi 5 phút để quét các sản phẩm thiếu kho.
     * fixedRate = 300000ms = 5 phút.
     * initialDelay = 60000ms (Tránh conflict với TestDataSeeder lúc khởi động)
     */
    @Scheduled(initialDelay = 60000, fixedRate = 300000)
    @Transactional
    public void syncMissingInventories() {
        log.info("Bắt đầu Job Auto-healing: Quét các sản phầm thiếu bản ghi tồn kho...");

        // Tìm tất cả sản phẩm
        List<Product> allProducts = productRepository.findAll();
        int createdCount = 0;

        for (Product product : allProducts) {
            // Nếu sản phẩm chưa có Inventory (liên kết null)
            if (product.getInventory() == null) {
                log.warn("Phát hiện sản phẩm thiếu kho [ID: {}, Tên: {}]. Đang tự động tạo...", 
                         product.getId(), product.getName());

                Inventory newInventory = new Inventory();
                newInventory.setProduct(product);
                newInventory.setQuantity(0);
                newInventory.setReserved(0);
                
                // Thiết lập liên kết ngược lại cho Product để đồng bộ Context hiện tại
                product.setInventory(newInventory);
                
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
