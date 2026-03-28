package com.project.auth.service;

import com.project.auth.repository.RefreshTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TokenCleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TokenCleanupScheduler.class);

    private final RefreshTokenRepository refreshTokenRepository;

    public TokenCleanupScheduler(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    // Cron = "Giây Phút Lần_trong_giờ Ngày Tháng Năm". 
    // Dưới đây cấu hình chạy MỖI NGÀY lúc 00:00:00 NỬA ĐÊM
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void scheduleExpiredTokenCleanup() {
        int deleted = refreshTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        logger.info("[CRON CPU] Giải phóng hoàn thành {} refresh token hết hạn ra khỏi CSDL.", deleted);
    }
}
