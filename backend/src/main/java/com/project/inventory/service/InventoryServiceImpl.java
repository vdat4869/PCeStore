package com.project.inventory.service;

import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.dto.InventoryResponse;
import com.project.inventory.entity.Inventory;
import com.project.inventory.repository.InventoryRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cài đặt các nghiệp vụ quản lý tồn kho.
 * Sử dụng Transactional để đảm bảo tính toàn vẹn dữ liệu khi thao tác nhiều
 * bảng.
 */
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

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
    public InventoryResponse updateStock(InventoryRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("error.product.not_found"));

        // Sử dụng Lock để đảm bảo không có luồng nào khác can thiệp khi đang cập nhật
        Inventory inventory = inventoryRepository.findByProductIdWithLock(product.getId())
                .orElseGet(() -> {
                    Inventory newInv = new Inventory();
                    newInv.setProduct(product);
                    newInv.setQuantity(0);
                    newInv.setReserved(0);
                    return newInv;
                });

        // Cập nhật số lượng mới
        inventory.setQuantity(request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public InventoryResponse decreaseStock(InventoryRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("error.product.not_found"));

        Inventory inventory = inventoryRepository.findByProductIdWithLock(product.getId())
                .orElseGet(() -> {
                    Inventory newInv = new Inventory();
                    newInv.setProduct(product);
                    newInv.setQuantity(0);
                    newInv.setReserved(0);
                    return inventoryRepository.save(newInv);
                });

        int requestedQuantity = request.getQuantity();

        // Kiểm tra xem số lượng trong kho có đủ để trừ không (Overselling Prevention)
        if (inventory.getQuantity() < requestedQuantity) {
            throw new RuntimeException("error.inventory.overselling"); // Lỗi: Không đủ hàng trong kho
        }

        // Trừ kho vật lý
        inventory.setQuantity(inventory.getQuantity() - requestedQuantity);
        Inventory saved = inventoryRepository.save(inventory);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public InventoryResponse increaseStock(InventoryRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("error.product.not_found"));

        // Khóa dòng khi cộng lại kho
        Inventory inventory = inventoryRepository.findByProductIdWithLock(product.getId())
                .orElseGet(() -> {
                    Inventory newInv = new Inventory();
                    newInv.setProduct(product);
                    newInv.setQuantity(0);
                    newInv.setReserved(0);
                    return inventoryRepository.save(newInv);
                });

        // Cộng lại số lượng (thường dùng khi hủy đơn hàng)
        inventory.setQuantity(inventory.getQuantity() + request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);

        return mapToResponse(saved);
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
