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

        // Khởi tạo đối tượng Product (không còn trường stock trực tiếp)
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .brand(request.getBrand())
                .imageUrl(request.getImageUrl())
                .build();

        // Tạo bản ghi Inventory tương ứng và liên kết với Product
        com.project.inventory.entity.Inventory inventory = com.project.inventory.entity.Inventory.builder()
                .product(product)
                .quantity(request.getStock() != null ? request.getStock() : 0)
                .reserved(0)
                .build();
        
        // Thiết lập liên kết xuôi-ngược để Cascade hoạt động
        product.setInventory(inventory);

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
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setImageUrl(request.getImageUrl());

        // Lưu ý: Việc cập nhật số lượng tồn kho (stock) nên được thực hiện qua InventoryService
        // để đảm bảo tính nhất quán và cơ chế Locking. Ở đây ta chỉ cập nhật thông tin cơ bản.
        if (request.getStock() != null && product.getInventory() != null) {
            product.getInventory().setQuantity(request.getStock());
        }

        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    /**
     * Xóa một sản phẩm (Soft Delete)
     */
    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        // Đánh dấu xóa mềm cho sản phẩm
        product.setDeleted(true);
        
        // Luôn đánh dấu xóa mềm cho kho hàng đi kèm
        if (product.getInventory() != null) {
            product.getInventory().setDeleted(true);
        }
        
        productRepository.save(product);
    }

    /**
     * Khôi phục sản phẩm đã xóa mềm (Restore)
     */
    @Override
    @Transactional
    public void restoreProduct(Long id) {
        Product product = productRepository.findByIdIncludingDeleted(id)
                .orElseThrow(() -> new RuntimeException("Product not found (including deleted) with id: " + id));

        product.setDeleted(false);
        
        // Khôi phục luôn kho hàng
        if (product.getInventory() != null) {
            product.getInventory().setDeleted(false);
        }

        productRepository.save(product);
    }

    /**
     * Hàm tiện ích (Utility): Chuyển đổi đối tượng Product (Entity) sang ProductResponse (DTO trả về)
     */
    private ProductResponse mapToResponse(Product product) {
        // Lấy số lượng từ Inventory liên kết (nếu có)
        Integer currentStock = (product.getInventory() != null) ? product.getInventory().getQuantity() : 0;

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(currentStock)
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
