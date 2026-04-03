package com.project.inventory.controller;

import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.dto.InventoryResponse;
import com.project.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý luồng dữ liệu tồn kho.
 * Cung cấp các API kiểm tra, cập nhật và trừ kho để phục vụ việc bán hàng.
 */
@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Quản lý tồn kho sản phẩm")
public class InventoryController {

    private final InventoryService inventoryService;

    @Operation(summary = "Lấy thông tin tồn kho", description = "Truy xuất số lượng thực tế và số lượng có sẵn cho một sản phẩm.")
    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getStock(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getStock(productId));
    }

    @Operation(summary = "Cập nhật số lượng tồn kho", description = "Cho phép ADMIN hoặc EMPLOYEE cập nhật lại số lượng hàng trong kho.")
    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryResponse> updateStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(request));
    }

    @Operation(summary = "Trừ tồn kho", description = "Được gọi khi có đơn hàng mới. Đảm bảo chống bán vượt mức (overselling) bằng Lock database.")
    @PostMapping("/decrease")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE') or hasRole('USER')")
    public ResponseEntity<InventoryResponse> decreaseStock(@Valid @RequestBody InventoryRequest request) {
        // Tạm thời cho phép USER được gọi để phục vụ luồng checkout hoặc test
        return ResponseEntity.ok(inventoryService.decreaseStock(request));
    }

    @Operation(summary = "Hoàn lại tồn kho", description = "Được gọi khi đơn hàng bị hủy để cộng lại số lượng vào kho.")
    @PostMapping("/increase")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE') or hasRole('USER')")
    public ResponseEntity<InventoryResponse> increaseStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.increaseStock(request));
    }
}

