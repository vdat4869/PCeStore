package com.project.auth.repository;

import com.project.auth.entity.RefreshToken;
import com.project.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // Tìm Refresh Token dựa trên chuỗi token
    Optional<RefreshToken> findByToken(String token);

    // Xóa tất cả Refresh Token của một người dùng (hữu ích khi Logout hoặc đăng nhập lại ở thiết bị khác)
    @Modifying
    int deleteByUser(User user);

    // Xóa hàng loạt các Token đã quá hạn ngày (Dọn rác DB)
    @Modifying
    int deleteByExpiryDateBefore(java.time.LocalDateTime now);
}
