package com.project.common.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.RemovalCause;
import com.github.benmanes.caffeine.cache.RemovalListener;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class LoginAttemptService {

    private final int MAX_ATTEMPT = 5;
    
    // Lưu số lần thử, hết hạn sau 12 tiếng nếu không thử tiếp
    private final Cache<String, Integer> attemptsCache;
    
    // Lưu trạng thái Lock (Key=email, Value=true). Tự xoá sau đúng 5 phút
    private final Cache<String, Boolean> lockCache;

    private final UserRepository userRepository;

    public LoginAttemptService(UserRepository userRepository) {
        this.userRepository = userRepository;

        this.attemptsCache = Caffeine.newBuilder()
                .expireAfterWrite(12, TimeUnit.HOURS)
                .build();

        // Xây dựng Listener bắt sự kiện khi đối tượng bị văng khỏi Cache do hết 5 phút
        RemovalListener<String, Boolean> unlockListener = (String email, Boolean value, RemovalCause cause) -> {
            if (cause.wasEvicted() || cause == RemovalCause.EXPIRED) {
                // Phục hồi lại trạng thái ACTIVE trên Database một cách thầm lặng
                userRepository.findByEmail(email).ifPresent(u -> {
                    u.setStatus(UserStatus.ACTIVE);
                    userRepository.save(u);
                    System.out.println("[AUTO-HEALING] Gỡ khoá tự động rào cản Brute Force cho: " + email);
                });
            }
        };

        this.lockCache = Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .evictionListener(unlockListener)
                .build();
    }

    // Login thành công
    public void loginSucceeded(String email) {
        attemptsCache.invalidate(email);
        lockCache.invalidate(email);
    }

    // Login thất bại
    public void loginFailed(String email) {
        int attempts = attemptsCache.get(email, k -> 0);
        attempts++;
        attemptsCache.put(email, attempts);

        if (attempts >= MAX_ATTEMPT) {
            lockCache.put(email, true);
            attemptsCache.invalidate(email); // Reset đếm để chuẩn bị cho chu trình khóa kế tiếp nếu tiếp tục dò
            
            // Auto Update trạng thái INACTIVE tạm thời xuống DB ngăn chặn hoàn toàn
            userRepository.findByEmail(email).ifPresent(u -> {
                u.setStatus(UserStatus.INACTIVE);
                userRepository.save(u);
                System.out.println("[AUTO-HEALING] Kích hoạt rào cản Database (INACTIVE) do có biến cố ngầm tại: " + email);
            });
        }
    }

    // Check account đã bị khoá ảo trên cache chưa
    public boolean isBlocked(String email) {
        return lockCache.getIfPresent(email) != null;
    }
}
