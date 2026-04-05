package com.project.inventory.service;

import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.dto.InventoryResponse;
import com.project.inventory.entity.Inventory;
import com.project.inventory.entity.InventoryHistory;
import com.project.inventory.repository.InventoryHistoryRepository;
import com.project.inventory.repository.InventoryRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cài đặt các nghiệp vụ quản lý tồn kho.
 * Sử dụng Transactional để đảm bảo tính toàn vẹn dữ liệu khi thao tác nhiều
 * bảng.
 */
@Service
public class InventoryServiceImpl implements InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final InventoryHistoryRepository historyRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository, 
                                ProductRepository productRepository,
                                InventoryHistoryRepository historyRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.historyRepository = historyRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getStock(Long productId) {
        // Tìm kho theo ID sản phẩm, nếu chưa có thì khởi tạo bản ghi mới
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> createEmptyInventory(productId));
        return mapToResponse(inventory);
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public InventoryResponse updateStock(InventoryRequest request) {
        log.info("ADMIN cập nhật tồn kho [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("error.product.not_found"));

        Inventory inventory = inventoryRepository.findByProductIdWithLock(product.getId())
                .orElseGet(() -> createEmptyInventory(product.getId()));

        inventory.setQuantity(request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);

        saveHistory(product.getId(), request.getQuantity(), InventoryHistory.HistoryType.UPDATE, "Admin manual update");

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 500))
    public InventoryResponse decreaseStock(InventoryRequest request) {
        log.info("Trừ kho trực tiếp [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        Inventory inventory = getInventoryWithLock(request.getProductId());

        if (inventory.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("error.inventory.insufficient_stock");
        }

        inventory.setQuantity(inventory.getQuantity() - request.getQuantity());
        saveHistory(request.getProductId(), -request.getQuantity(), InventoryHistory.HistoryType.DECREASE, "Direct decrease");
        
        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public InventoryResponse increaseStock(InventoryRequest request) {
        log.info("Tăng kho trực tiếp [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        Inventory inventory = getInventoryWithLock(request.getProductId());

        inventory.setQuantity(inventory.getQuantity() + request.getQuantity());
        saveHistory(request.getProductId(), request.getQuantity(), InventoryHistory.HistoryType.REPLENISH, "Direct increase/replenish");

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3)
    public InventoryResponse reserveStock(InventoryRequest request) {
        log.info("Giữ hàng tạm thời [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        Inventory inventory = getInventoryWithLock(request.getProductId());

        int available = inventory.getQuantity() - inventory.getReserved();
        if (available < request.getQuantity()) {
            throw new RuntimeException("error.inventory.insufficient_available_stock");
        }

        inventory.setReserved(inventory.getReserved() + request.getQuantity());
        saveHistory(request.getProductId(), request.getQuantity(), InventoryHistory.HistoryType.RESERVE, "Reserve for order");

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public InventoryResponse confirmStock(InventoryRequest request) {
        log.info("Xác nhận đơn hàng - Trừ kho chính thức [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        Inventory inventory = getInventoryWithLock(request.getProductId());

        if (inventory.getReserved() < request.getQuantity()) {
            // Trường hợp hy hữu: confirm nhiều hơn số đã reserve
            log.error("Lỗi logic: Confirm ({}) > Reserved ({})", request.getQuantity(), inventory.getReserved());
        }

        inventory.setQuantity(inventory.getQuantity() - request.getQuantity());
        inventory.setReserved(Math.max(0, inventory.getReserved() - request.getQuantity()));
        
        saveHistory(request.getProductId(), -request.getQuantity(), InventoryHistory.HistoryType.CONFIRM_ORDER, "Order payment confirmed");

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public InventoryResponse cancelReservation(InventoryRequest request) {
        log.info("Huỷ giữ hàng [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        Inventory inventory = getInventoryWithLock(request.getProductId());

        inventory.setReserved(Math.max(0, inventory.getReserved() - request.getQuantity()));
        saveHistory(request.getProductId(), -request.getQuantity(), InventoryHistory.HistoryType.CANCEL_RESERVE, "Reservation cancelled");

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryHistory> getHistory(Long productId, Pageable pageable) {
        return historyRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    private Inventory getInventoryWithLock(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("error.product.not_found"));
        
        return inventoryRepository.findByProductIdWithLock(product.getId())
                .orElseGet(() -> createEmptyInventory(productId));
    }

    private void saveHistory(Long productId, Integer amount, InventoryHistory.HistoryType type, String reason) {
        InventoryHistory history = InventoryHistory.builder()
                .productId(productId)
                .changeAmount(amount)
                .type(type)
                .reason(reason)
                .build();
        historyRepository.save(history);
    }

    /**
     * Tạo bản ghi kho trống cho sản phẩm nếu chưa tồn tại.
     */
    private Inventory createEmptyInventory(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("error.product.not_found"));

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantity(0);
        inventory.setReserved(0);
        return inventoryRepository.save(inventory);
    }

    /**
     * Chuyển đổi từ Entity sang DTO để trả về cho Client.
     */
    private InventoryResponse mapToResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProduct().getId())
                .productName(inventory.getProduct().getName())
                .quantity(inventory.getQuantity())
                .reserved(inventory.getReserved())
                .availableStock(inventory.getQuantity() - inventory.getReserved())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}
