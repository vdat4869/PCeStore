package com.project.product.repository;

import com.project.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Tìm kiếm các sản phẩm có chứa từ khoá trong tên (Mặc định lọc is_deleted = false)
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Truy vấn danh sách toàn bộ sản phẩm thuộc về một danh mục
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    // Lọc theo khoảng giá
    Page<Product> findByPriceBetween(Double minPrice, Double maxPrice, Pageable pageable);

    // Tìm kiếm sản phẩm bất kể trạng thái xóa (Dùng cho Admin khôi phục)
    @Query(value = "SELECT * FROM products WHERE id = :id", nativeQuery = true)
    Optional<Product> findByIdIncludingDeleted(@Param("id") Long id);
}
