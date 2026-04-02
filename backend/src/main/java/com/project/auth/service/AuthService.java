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
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
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
import java.security.GeneralSecurityException;
import java.io.IOException;

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
    private final MessageSource messageSource;

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
                       MailService mailService,
                       MessageSource messageSource) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
        this.loginAttemptService = loginAttemptService;
        this.emailTokenRepository = emailTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailService = mailService;
        this.messageSource = messageSource;
    }

    private String translate(String key) {
        return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
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

        return translate("success.auth.register_verify");
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
        return translate("success.auth.email_verified");
    }

    public String resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            return translate("success.auth.account_active");
        }

        // Xóa token cũ
        emailTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken(user, token, LocalDateTime.now().plusHours(24));
        emailTokenRepository.save(verificationToken);

        mailService.sendVerificationEmail(user.getEmail(), token);
        return translate("success.auth.email_resend");
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(user, token, LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(resetToken);

        mailService.sendPasswordResetEmail(user.getEmail(), token);
        return translate("success.auth.pwd_link_sent");
    }

    public String resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.reset_token_invalid"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("error.auth.token_expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
        return translate("success.auth.pwd_reset");
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
            throw new org.springframework.security.authentication.DisabledException("error.auth.disabled");
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
                throw new IllegalArgumentException("error.auth.google_invalid");
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

        } catch (GeneralSecurityException | IOException | IllegalArgumentException e) {
            loginAttemptService.logLoginAudit("UNKNOWN_GOOGLE", ipAddress, false, "Lỗi xác thực Google ID Token / Database");
            throw new IllegalArgumentException("error.auth.google_failed", e);
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

    public String logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));
        refreshTokenService.deleteByUserId(user.getId());
        return translate("success.auth.logout");
    }
}
