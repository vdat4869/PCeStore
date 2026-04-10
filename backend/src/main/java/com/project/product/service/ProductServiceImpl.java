package com.project.product.service;

import com.project.product.dto.ProductRequest;
import com.project.product.dto.ProductResponse;
import com.project.product.entity.Category;
import com.project.product.entity.Product;
import com.project.product.repository.CategoryRepository;
import com.project.product.repository.ProductRepository;
import com.project.common.exception.ResourceNotFoundException;
import com.project.product.event.ProductCreatedEvent;
import com.project.inventory.repository.InventoryRepository;
import com.project.inventory.entity.Inventory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MessageSource messageSource;
    private final ApplicationEventPublisher eventPublisher;
    private final InventoryRepository inventoryRepository;

    public ProductServiceImpl(ProductRepository productRepository, 
                              CategoryRepository categoryRepository, 
                              MessageSource messageSource, 
                              ApplicationEventPublisher eventPublisher,
                              InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.messageSource = messageSource;
        this.eventPublisher = eventPublisher;
        this.inventoryRepository = inventoryRepository;
    }

    private String getMessage(String key, Object... args) {
        return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
    }

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
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.product.not_found", id)));
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
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.category.not_found", request.getCategoryId())));

        // Khởi tạo đối tượng Product (không còn trường stock trực tiếp)
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .brand(request.getBrand())
                .imageUrl(request.getImageUrl())
                .build();

        Product savedProduct = productRepository.save(product);

        // Kỹ thuật Event-Driven: Gọi sang module Inventory một cách lỏng lẻo
        Integer initialStock = request.getStock() != null ? request.getStock() : 0;
        eventPublisher.publishEvent(new ProductCreatedEvent(savedProduct.getId(), initialStock));

        return mapToResponse(savedProduct);
    }

    /**
     * Cập nhật thông tin của một sản phẩm đã có sẵn
     */
    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.product.not_found", id)));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.category.not_found", request.getCategoryId())));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setImageUrl(request.getImageUrl());

        // Việc cập nhật số lượng tồn kho (stock) hiện tại đã bóc tách về Inventory module.
        // ProductService sẽ không được phép can thiệp số liệu kho tại đây nữa.

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
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.product.not_found", id)));
        
        // Đánh dấu xóa mềm cho sản phẩm
        product.setDeleted(true);
        
        // Để xoá được Inventory ở module khác, cần publish một xoá kiện (SoftDeleteEvent) 
        // hoặc để quá trình Clean-up batch job thực thi. Tại đây ta chỉ xoá phạm vi Product.
        
        productRepository.save(product);
    }

    /**
     * Khôi phục sản phẩm đã xóa mềm (Restore)
     */
    @Override
    @Transactional
    public void restoreProduct(Long id) {
        Product product = productRepository.findByIdIncludingDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.product.not_found", id)));

        product.setDeleted(false);
        
        // Việc thao tác khôi phục Inventory sẽ thực hiện bên trong InventoryService.

        productRepository.save(product);
    }

    /**
     * Hàm tiện ích (Utility): Chuyển đổi đối tượng Product (Entity) sang ProductResponse (DTO trả về)
     */
    private ProductResponse mapToResponse(Product product) {
        // Lấy số lượng từ Inventory module
        Integer currentStock = inventoryRepository.findByProductId(product.getId())
                .map(Inventory::getQuantity)
                .orElse(0);

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
