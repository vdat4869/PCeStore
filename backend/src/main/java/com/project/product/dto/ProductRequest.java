package com.project.product.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Positive(message = "Giá sản phẩm phải lớn hơn 0")
    private Double price;

    @PositiveOrZero(message = "Số lượng tồn kho không được âm")
    private Integer stock;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotBlank(message = "Thương hiệu không được để trống")
    private String brand;

    private String imageUrl;

    // --- Constructors ---
    public ProductRequest() {}

    public ProductRequest(String name, String description, Double price, Integer stock, Long categoryId, String brand, String imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.categoryId = categoryId;
        this.brand = brand;
        this.imageUrl = imageUrl;
    }

    // --- Getters and Setters ---
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    // --- Manual Builder ---
    public static ProductRequestBuilder builder() {
        return new ProductRequestBuilder();
    }

    public static class ProductRequestBuilder {
        private String name;
        private String description;
        private Double price;
        private Integer stock;
        private Long categoryId;
        private String brand;
        private String imageUrl;

        public ProductRequestBuilder name(String name) { this.name = name; return this; }
        public ProductRequestBuilder description(String description) { this.description = description; return this; }
        public ProductRequestBuilder price(Double price) { this.price = price; return this; }
        public ProductRequestBuilder stock(Integer stock) { this.stock = stock; return this; }
        public ProductRequestBuilder categoryId(Long categoryId) { this.categoryId = categoryId; return this; }
        public ProductRequestBuilder brand(String brand) { this.brand = brand; return this; }
        public ProductRequestBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }

        public ProductRequest build() {
            return new ProductRequest(name, description, price, stock, categoryId, brand, imageUrl);
        }
    }
}
