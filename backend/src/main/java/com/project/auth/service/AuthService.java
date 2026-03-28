package com.project.auth.service;

import com.project.auth.dto.AuthResponse;
import com.project.auth.dto.LoginRequest;
import com.project.auth.dto.RefreshTokenRequest;
import com.project.auth.dto.RegisterRequest;
import com.project.auth.entity.RefreshToken;
import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import com.project.common.security.CustomUserDetails;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import java.sql.SQLException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final com.project.common.security.LoginAttemptService loginAttemptService;

    // Tiêm các dependency dùng thủ công không nhờ lombok
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       RefreshTokenService refreshTokenService,
                       com.project.common.security.LoginAttemptService loginAttemptService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
        this.loginAttemptService = loginAttemptService;
    }

    // Đăng ký người dùng
    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public String register(RegisterRequest request) {
        // Kiểm tra email tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("error.auth.email_used");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()), // Hash mật khẩu
                UserRole.CUSTOMER, // Mặc định role là CUSTOMER
                UserStatus.ACTIVE
        );

        userRepository.save(user);

        return "success.auth.registered";
    }

    // Đăng nhập
    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail();
        if (loginAttemptService.isBlocked(email)) {
            throw new org.springframework.security.authentication.LockedException("error.auth.account_locked");
        }

        try {
            // Xác thực người dùng bằng Spring Security Manager
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.getPassword()
                    )
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            loginAttemptService.loginFailed(email);
            throw new org.springframework.security.authentication.BadCredentialsException("error.auth.bad_credentials");
        }

        // Kiểm tra đúng pass -> Cập nhật xoá bộ nhớ đếm sai
        loginAttemptService.loginSucceeded(email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

        // Tạo JWT qua CustomUserDetails
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        // Tạo Refresh Token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new AuthResponse(jwtToken, refreshToken.getToken());
    }

    // Làm mới Access Token thông qua Refresh Token
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        
        return refreshTokenService.findByToken(token)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    CustomUserDetails userDetails = new CustomUserDetails(user);
                    String accessToken = jwtService.generateToken(userDetails);
                    return new AuthResponse(accessToken, token);
                })
                .orElseThrow(() -> new IllegalArgumentException("error.auth.refresh_invalid"));
    }

    // Đăng xuất: Xoá refresh token của người dùng (nếu có context xác thực)
    // Tạm thời cho phép user truyền email qua hàm hoặc lọc qua DB 
    // Thông thường AccessToken hết hạn client ko gửi thì logout. Nhưng xoá refresh Token triệt rể
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));
        
        refreshTokenService.deleteByUserId(user.getId());
    }
}
