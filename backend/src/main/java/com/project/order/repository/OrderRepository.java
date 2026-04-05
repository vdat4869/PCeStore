package com.project.order.repository;

import com.project.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Tìm kiếm các đơn hàng của user (Mặc định lọc is_deleted = false)
    List<Order> findByUserId(Long userId);

    // Tìm kiếm đơn hàng bất kể trạng thái xóa (Dùng cho Admin)
    @Query(value = "SELECT * FROM orders WHERE id = :id", nativeQuery = true)
    Optional<Order> findByIdIncludingDeleted(@Param("id") Long id);
}
