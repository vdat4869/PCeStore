package com.project.auth.service;

import com.project.auth.entity.RefreshToken;
import com.project.auth.entity.User;
import com.project.auth.repository.RefreshTokenRepository;
import com.project.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken createRefreshToken(Long userId) {
        // Tìm User từ database
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        
        // Chuỗi token random duy nhất
        String token = UUID.randomUUID().toString();
        
        // Tạo hạn sử dụng
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(refreshTokenDurationMs / 1000);

        RefreshToken refreshToken = new RefreshToken(user, token, expiryDate);

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        // Nếu ngày hết hạn nằm trước thời điểm hiện tại
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token đã hết hạn. Vui lòng đăng nhập lại!");
        }
        return token;
    }

    @Transactional
    public int deleteByUserId(Long userId) {
        // Cần truyền User entity cho repository
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        return refreshTokenRepository.deleteByUser(user);
    }
}
