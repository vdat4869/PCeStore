package com.project.inventory.entity;

import com.project.product.entity.Product;
import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Thực thể quản lý kho của một sản phẩm.
 * Tách biệt khỏi bảng Product để tối ưu việc cập nhật số lượng và khóa dòng (locking).
 */
@Entity
@Table(name = "inventories", indexes = {
    @Index(name = "idx_inventory_product", columnList = "product_id")
})
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer quantity;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer reserved;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- Constructors ---
    public Inventory() {}

    public Inventory(Long id, Product product, Integer quantity, Integer reserved, LocalDateTime updatedAt) {
        this.id = id;
        this.product = product;
        this.quantity = quantity;
        this.reserved = reserved;
        this.updatedAt = updatedAt;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getReserved() { return reserved; }
    public void setReserved(Integer reserved) { this.reserved = reserved; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // --- Manual Builder ---
    public static InventoryBuilder builder() {
        return new InventoryBuilder();
    }

    public static class InventoryBuilder {
        private Long id;
        private Product product;
        private Integer quantity;
        private Integer reserved;
        private LocalDateTime updatedAt;

        public InventoryBuilder id(Long id) { this.id = id; return this; }
        public InventoryBuilder product(Product product) { this.product = product; return this; }
        public InventoryBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public InventoryBuilder reserved(Integer reserved) { this.reserved = reserved; return this; }
        public InventoryBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Inventory build() {
            return new Inventory(id, product, quantity, reserved, updatedAt);
        }
    }
}

