package com.project.inventory.service;

import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.dto.InventoryResponse;
import com.project.inventory.entity.Inventory;
import com.project.inventory.entity.InventoryHistory;
import com.project.inventory.repository.InventoryHistoryRepository;
import com.project.inventory.repository.InventoryRepository;
import com.project.common.exception.ResourceNotFoundException;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
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
    private static final String ERROR_PRODUCT_NOT_FOUND = "error.product.not_found";

    private final InventoryRepository inventoryRepository;
    private final InventoryHistoryRepository historyRepository;
    private final MessageSource messageSource;

    public InventoryServiceImpl(InventoryRepository inventoryRepository, 
                                InventoryHistoryRepository historyRepository,
                                MessageSource messageSource) {
        this.inventoryRepository = inventoryRepository;
        this.historyRepository = historyRepository;
        this.messageSource = messageSource;
    }

    private String getMessage(String key, Object... args) {
        return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
    }

    private void checkIdempotency(String referenceId) {
        if (referenceId != null && !referenceId.trim().isEmpty()) {
            if (historyRepository.existsByReferenceId(referenceId)) {
                log.warn("Phát hiện giao dịch lặp lại với referenceId: {}", referenceId);
                throw new IllegalStateException(getMessage("error.inventory.duplicate_transaction"));
            }
        } else {
            log.warn("CẢNH BÁO: Giao dịch tồn kho không có referenceId! Hệ thống có nguy cơ trừ trùng.");
        }
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
        
        Inventory inventory = inventoryRepository.findByProductIdWithLock(request.getProductId())
                .orElseGet(() -> createEmptyInventory(request.getProductId()));

        inventory.setQuantity(request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);

        saveHistory(request.getProductId(), request.getQuantity(), InventoryHistory.HistoryType.UPDATE, "Admin manual update", request.getReferenceId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 500))
    public InventoryResponse decreaseStock(InventoryRequest request) {
        log.info("Trừ kho trực tiếp [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        checkIdempotency(request.getReferenceId());
        
        Inventory inventory = getInventoryWithLock(request.getProductId());

        if (inventory.getQuantity() < request.getQuantity()) {
            throw new IllegalStateException(getMessage("error.inventory.insufficient_stock"));
        }

        inventory.setQuantity(inventory.getQuantity() - request.getQuantity());
        saveHistory(request.getProductId(), -request.getQuantity(), InventoryHistory.HistoryType.DECREASE, "Direct decrease", request.getReferenceId());
        
        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public InventoryResponse increaseStock(InventoryRequest request) {
        log.info("Tăng kho trực tiếp [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        checkIdempotency(request.getReferenceId());
        
        Inventory inventory = getInventoryWithLock(request.getProductId());

        inventory.setQuantity(inventory.getQuantity() + request.getQuantity());
        saveHistory(request.getProductId(), request.getQuantity(), InventoryHistory.HistoryType.REPLENISH, "Direct increase/replenish", request.getReferenceId());

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3)
    public InventoryResponse reserveStock(InventoryRequest request) {
        log.info("Giữ hàng tạm thời [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        checkIdempotency(request.getReferenceId());
        
        Inventory inventory = getInventoryWithLock(request.getProductId());

        int available = inventory.getQuantity() - inventory.getReserved();
        if (available < request.getQuantity()) {
            throw new IllegalStateException(getMessage("error.inventory.insufficient_available_stock"));
        }

        inventory.setReserved(inventory.getReserved() + request.getQuantity());
        saveHistory(request.getProductId(), request.getQuantity(), InventoryHistory.HistoryType.RESERVE, "Reserve for order", request.getReferenceId());

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public InventoryResponse confirmStock(InventoryRequest request) {
        log.info("Xác nhận đơn hàng - Trừ kho chính thức [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        checkIdempotency(request.getReferenceId());
        
        Inventory inventory = getInventoryWithLock(request.getProductId());

        if (inventory.getReserved() < request.getQuantity()) {
            // Trường hợp hy hữu: confirm nhiều hơn số đã reserve
            log.error("Lỗi logic: Confirm ({}) > Reserved ({})", request.getQuantity(), inventory.getReserved());
        }

        inventory.setQuantity(inventory.getQuantity() - request.getQuantity());
        inventory.setReserved(Math.max(0, inventory.getReserved() - request.getQuantity()));
        
        saveHistory(request.getProductId(), -request.getQuantity(), InventoryHistory.HistoryType.CONFIRM_ORDER, "Order payment confirmed", request.getReferenceId());

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public InventoryResponse cancelReservation(InventoryRequest request) {
        log.info("Huỷ giữ hàng [ProductID: {}, Qty: {}]", request.getProductId(), request.getQuantity());
        checkIdempotency(request.getReferenceId());
        
        Inventory inventory = getInventoryWithLock(request.getProductId());

        inventory.setReserved(Math.max(0, inventory.getReserved() - request.getQuantity()));
        saveHistory(request.getProductId(), -request.getQuantity(), InventoryHistory.HistoryType.CANCEL_RESERVE, "Reservation cancelled", request.getReferenceId());

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryHistory> getHistory(Long productId, Pageable pageable) {
        return historyRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    private Inventory getInventoryWithLock(Long productId) {
        return inventoryRepository.findByProductIdWithLock(productId)
                .orElseGet(() -> createEmptyInventory(productId));
    }

    private void saveHistory(Long productId, Integer amount, InventoryHistory.HistoryType type, String reason, String referenceId) {
        InventoryHistory history = InventoryHistory.builder()
                .productId(productId)
                .changeAmount(amount)
                .type(type)
                .reason(reason)
                .referenceId(referenceId)
                .build();
        historyRepository.save(history);
    }

    /**
     * Tạo bản ghi kho trống cho sản phẩm nếu chưa tồn tại.
     */
    private Inventory createEmptyInventory(Long productId) {
        Inventory inventory = new Inventory();
        inventory.setProductId(productId);
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
                .productId(inventory.getProductId())
                .quantity(inventory.getQuantity())
                .reserved(inventory.getReserved())
                .availableStock(inventory.getQuantity() - inventory.getReserved())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}
