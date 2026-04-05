package com.project.inventory.dto;

import java.time.LocalDateTime;

/**
 * DTO trả về thông tin chi tiết về trạng thái lưu kho của sản phẩm.
 */
public class InventoryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Integer reserved;
    private Integer availableStock;
    private LocalDateTime updatedAt;

    // --- Constructors ---
    public InventoryResponse() {}

    public InventoryResponse(Long id, Long productId, String productName, Integer quantity, Integer reserved, Integer availableStock, LocalDateTime updatedAt) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.reserved = reserved;
        this.availableStock = availableStock;
        this.updatedAt = updatedAt;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getReserved() { return reserved; }
    public void setReserved(Integer reserved) { this.reserved = reserved; }

    public Integer getAvailableStock() { return availableStock; }
    public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // --- Manual Builder ---
    public static InventoryResponseBuilder builder() {
        return new InventoryResponseBuilder();
    }

    public static class InventoryResponseBuilder {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private Integer reserved;
        private Integer availableStock;
        private LocalDateTime updatedAt;

        public InventoryResponseBuilder id(Long id) { this.id = id; return this; }
        public InventoryResponseBuilder productId(Long productId) { this.productId = productId; return this; }
        public InventoryResponseBuilder productName(String productName) { this.productName = productName; return this; }
        public InventoryResponseBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public InventoryResponseBuilder reserved(Integer reserved) { this.reserved = reserved; return this; }
        public InventoryResponseBuilder availableStock(Integer availableStock) { this.availableStock = availableStock; return this; }
        public InventoryResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }


        public InventoryResponse build() {
            return new InventoryResponse(id, productId, productName, quantity, reserved, availableStock, updatedAt);
        }
    }
}

