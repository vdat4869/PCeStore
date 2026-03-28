package com.project.auth.repository;

import com.project.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm kiếm người dùng bằng email
    Optional<User> findByEmail(String email);

    // Kiểm tra xem email đã tồn tại trong hệ thống chưa (dùng cho tính năng đăng ký)
    boolean existsByEmail(String email);
}
