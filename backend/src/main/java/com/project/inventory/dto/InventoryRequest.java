package com.project.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO yêu cầu các thao tác về kho (Cập nhật, Trừ, Hoàn).
 */
public class InventoryRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    // --- Constructors ---
    public InventoryRequest() {}

    public InventoryRequest(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    // --- Getters and Setters ---
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    // --- Manual Builder ---
    public static InventoryRequestBuilder builder() {
        return new InventoryRequestBuilder();
    }

    public static class InventoryRequestBuilder {
        private Long productId;
        private Integer quantity;

        public InventoryRequestBuilder productId(Long productId) { this.productId = productId; return this; }
        public InventoryRequestBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }

        public InventoryRequest build() {
            return new InventoryRequest(productId, quantity);
        }
    }
}

