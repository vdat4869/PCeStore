package com.project.product.repository;

import com.project.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Tìm kiếm các sản phẩm có chứa từ khoá trong tên (Bỏ qua viết hoa/viết thường)
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Truy vấn danh sách toàn bộ sản phẩm thuộc về một danh mục (Category) cụ thể
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    // Lọc và lấy danh sách các mặt hàng nằm trong khoảng giá từ minPrice đến maxPrice
    Page<Product> findByPriceBetween(Double minPrice, Double maxPrice, Pageable pageable);
}
