package com.project.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.project.auth.dto.*;
import com.project.auth.entity.*;
import com.project.auth.repository.EmailVerificationTokenRepository;
import com.project.auth.repository.PasswordResetTokenRepository;
import com.project.auth.repository.UserRepository;
import com.project.common.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final com.project.common.security.LoginAttemptService loginAttemptService;
    private final EmailVerificationTokenRepository emailTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MailService mailService;

    @Value("${custom.security.google.client-id:}")
    private String googleClientId;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       RefreshTokenService refreshTokenService,
                       com.project.common.security.LoginAttemptService loginAttemptService,
                       EmailVerificationTokenRepository emailTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
        this.loginAttemptService = loginAttemptService;
        this.emailTokenRepository = emailTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailService = mailService;
    }

    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("error.auth.email_used");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                UserRole.CUSTOMER,
                UserStatus.INACTIVE // Đổi thành INACTIVE tạm thời để bắt xác thực
        );
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        // Tạo mã xác thực Email
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken(user, token, LocalDateTime.now().plusHours(24));
        emailTokenRepository.save(verificationToken);

        // Gửi mail
        mailService.sendVerificationEmail(user.getEmail(), token);

        return "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.";
    }

    public String verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay token."));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            emailTokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Token da het han.");
        }

        User user = verificationToken.getUser();
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        emailTokenRepository.delete(verificationToken);
        return "Xac thuc email thanh cong.";
    }

    public String resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            return "Tai khoan da duoc kich hoat.";
        }

        // Xóa token cũ
        emailTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken(user, token, LocalDateTime.now().plusHours(24));
        emailTokenRepository.save(verificationToken);

        mailService.sendVerificationEmail(user.getEmail(), token);
        return "Da gui lai email xac thuc.";
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(user, token, LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(resetToken);

        mailService.sendPasswordResetEmail(user.getEmail(), token);
        return "Da gui link dat lai mat khau toi email.";
    }

    public String resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token dat lai mat khau khong hop le"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Token dat lai mat khau da het han");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
        return "Dat lai mat khau thanh cong.";
    }

    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public AuthResponse login(LoginRequest request, String ipAddress) {
        String email = request.getEmail();
        if (loginAttemptService.isAccountLocked(email)) {
            throw new org.springframework.security.authentication.LockedException("error.auth.account_locked");
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            loginAttemptService.loginFailed(email, ipAddress, "Sai thông tin đăng nhập");
            throw new org.springframework.security.authentication.BadCredentialsException("error.auth.bad_credentials");
        }

        loginAttemptService.loginSucceeded(email, ipAddress);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new org.springframework.security.authentication.DisabledException("Tai khoan chua xac thuc hoac bi khoa.");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new AuthResponse(jwtToken, refreshToken.getToken());
    }

    public AuthResponse googleLogin(String idTokenString, String ipAddress) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid ID token.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User(email, passwordEncoder.encode(UUID.randomUUID().toString()), UserRole.CUSTOMER, UserStatus.ACTIVE);
                newUser.setAuthProvider(AuthProvider.GOOGLE);
                newUser.setFullName((String) payload.get("name"));
                return userRepository.save(newUser);
            });

            CustomUserDetails userDetails = new CustomUserDetails(user);
            String jwtToken = jwtService.generateToken(userDetails);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            // Ghi Audit cho Google Login thành công
            loginAttemptService.loginSucceeded(email, ipAddress);

            return new AuthResponse(jwtToken, refreshToken.getToken());

        } catch (Exception e) {
            loginAttemptService.logLoginAudit("UNKNOWN_GOOGLE", ipAddress, false, "Lỗi xác thực Google ID Token");
            throw new IllegalArgumentException("Google login failed.", e);
        }
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String reqToken = request.getRefreshToken();
        return refreshTokenService.findByToken(reqToken)
                .map(refreshTokenService::verifyExpiration)
                .map(rt -> {
                    // Refresh Token Rotation: Xoá token cũ, tạo cái mới
                    User user = rt.getUser();
                    refreshTokenService.deleteToken(rt);
                    
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                    CustomUserDetails userDetails = new CustomUserDetails(user);
                    String accessToken = jwtService.generateToken(userDetails);
                    return new AuthResponse(accessToken, newRefreshToken.getToken());
                })
                .orElseThrow(() -> new IllegalArgumentException("error.auth.refresh_invalid"));
    }

    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));
        refreshTokenService.deleteByUserId(user.getId());
    }
}
