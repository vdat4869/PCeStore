package com.project.product.service;

import com.project.product.dto.ProductRequest;
import com.project.product.dto.ProductResponse;
import com.project.product.entity.Category;
import com.project.product.entity.Product;
import com.project.product.repository.CategoryRepository;
import com.project.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Lấy danh sách tất cả sản phẩm (Có hỗ trợ phân trang)
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::mapToResponse);
    }

    /**
     * Tìm kiếm sản phẩm theo từ khoá tên mặt hàng (Không phân biệt hoa thường)
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String name, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(name, pageable).map(this::mapToResponse);
    }

    /**
     * Lọc danh sách sản phẩm theo ID của danh mục (CPU, GPU, RAM...)
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable).map(this::mapToResponse);
    }

    /**
     * Lọc danh sách sản phẩm theo khoảng giá tiền (Từ Giá Nhỏ Nhất đến Giá Lớn Nhất)
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByPriceRange(Double minPrice, Double maxPrice, Pageable pageable) {
        return productRepository.findByPriceBetween(minPrice, maxPrice, pageable).map(this::mapToResponse);
    }

    /**
     * Lấy thông tin chi tiết một sản phẩm dựa trên ID (Báo lỗi nếu không tồn tại)
     */
    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    /**
     * Tạo mới một sản phẩm và lưu vào cơ sở dữ liệu
     * Bao gồm bước kiểm tra Category ID có hợp lệ không
     */
    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .category(category)
                .brand(request.getBrand())
                .imageUrl(request.getImageUrl())
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    /**
     * Cập nhật thông tin của một sản phẩm đã có sẵn
     */
    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock() != null ? request.getStock() : product.getStock());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setImageUrl(request.getImageUrl());

        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    /**
     * Xóa một sản phẩm khỏi cơ sở dữ liệu
     */
    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    /**
     * Hàm tiện ích (Utility): Chuyển đổi đối tượng Product (Entity) sang ProductResponse (DTO trả về)
     */
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
