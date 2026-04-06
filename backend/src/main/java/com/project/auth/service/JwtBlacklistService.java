package com.project.auth.service;

import org.springframework.cache.CacheManager;
import org.springframework.cache.Cache;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Dịch vụ quản lý danh sách đen các JWT Token đã bị vô hiệu hoá.
 * Sử dụng Caffeine Cache thay vì Redis theo yêu cầu không dùng Docker.
 */
@Service
public class JwtBlacklistService {

    private final CacheManager cacheManager;
    private static final String CACHE_NAME = "jwtBlacklist";

    public JwtBlacklistService(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    /**
     * Vô hiệu hoá một JWT (khi phát hiện xâm nhập hoặc logout).
     */
    public void blacklistToken(String token) {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache != null) {
            cache.put(token, Boolean.TRUE);
        }
    }

    /**
     * Kiểm tra xem JWT có nằm trong danh sách đen không.
     */
    public boolean isBlacklisted(String token) {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache == null) return false;
        
        return Objects.nonNull(cache.get(token));
    }
}
