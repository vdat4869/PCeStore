package com.project.product.service;

import com.project.product.dto.ProductRequest;
import com.project.product.dto.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    Page<ProductResponse> getAllProducts(Pageable pageable);
    
    Page<ProductResponse> searchProducts(String name, Pageable pageable);
    
    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);
    
    Page<ProductResponse> getProductsByPriceRange(Double minPrice, Double maxPrice, Pageable pageable);

    ProductResponse getProductById(Long id);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    void restoreProduct(Long id);
}
