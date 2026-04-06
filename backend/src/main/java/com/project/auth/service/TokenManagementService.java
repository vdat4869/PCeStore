package com.project.auth.service;

import com.project.auth.dto.AuthResponse;
import com.project.auth.dto.RefreshTokenRequest;
import com.project.auth.entity.RefreshToken;
import com.project.auth.entity.User;
import com.project.common.security.CustomUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TokenManagementService {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final JwtBlacklistService blacklistService;

    public TokenManagementService(JwtService jwtService, 
                                  RefreshTokenService refreshTokenService, 
                                  JwtBlacklistService blacklistService) {
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.blacklistService = blacklistService;
    }

    public String generateAccessToken(User user) {
        return jwtService.generateToken(new CustomUserDetails(user));
    }

    public RefreshToken createRefreshToken(Long userId) {
        return refreshTokenService.createRefreshToken(userId);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String reqToken = request.getRefreshToken();
        return refreshTokenService.findByToken(reqToken)
                .map(refreshTokenService::verifyExpiration)
                .map(rt -> {
                    User user = rt.getUser();
                    // Refresh Token Rotation: Xoá token cũ, tạo cái mới
                    refreshTokenService.deleteToken(rt);
                    
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                    String accessToken = generateAccessToken(user);
                    return new AuthResponse(accessToken, newRefreshToken.getToken(), user.getRole().name());
                })
                .orElseThrow(() -> new IllegalArgumentException("error.auth.refresh_invalid"));
    }

    public void invalidateToken(String jwt) {
        if (jwt != null && jwt.startsWith("Bearer ")) {
            blacklistService.blacklistToken(jwt.substring(7));
        }
    }

    @Transactional
    public void deleteRefreshTokensForUser(Long userId) {
        refreshTokenService.deleteByUserId(userId);
    }

    @Transactional
    public void deleteRefreshTokensByEmail(String email) {
        refreshTokenService.findByUserEmail(email).ifPresent(refreshTokenService::deleteToken);
    }
}
