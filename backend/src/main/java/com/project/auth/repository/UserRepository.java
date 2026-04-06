package com.project.auth.repository;

import com.project.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm kiếm người dùng bằng email (Mặc định @SQLRestriction đã loại bỏ user is_deleted=true)
    Optional<User> findByEmail(String email);

    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    boolean existsByEmail(String email);

    // Tìm kiếm người dùng bất kể trạng thái xóa (Chỉ dùng cho Admin quản trị)
    @Query(value = "SELECT * FROM users WHERE id = :id", nativeQuery = true)
    Optional<User> findByIdIncludingDeleted(@Param("id") Long id);

    // Liệt kê toàn bộ người dùng (bao gồm cả đã xóa mềm) - Native Query để bypass @SQLRestriction
    @Query(value = "SELECT * FROM users", 
           countQuery = "SELECT count(*) FROM users", 
           nativeQuery = true)
    Page<User> findAllIncludingDeleted(Pageable pageable);

    // Tìm kiếm người dùng theo email hoặc tên (bao gồm cả đã xóa mềm)
    @Query(value = "SELECT * FROM users WHERE email LIKE %:keyword% OR full_name LIKE %:keyword%", 
           countQuery = "SELECT count(*) FROM users WHERE email LIKE %:keyword% OR full_name LIKE %:keyword%", 
           nativeQuery = true)
    Page<User> searchUsersIncludingDeleted(@Param("keyword") String keyword, Pageable pageable);
}
