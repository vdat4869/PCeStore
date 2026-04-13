package com.project.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.project.auth.dto.AuthResponse;
import com.project.auth.dto.LoginRequest;
import com.project.auth.dto.MfaSetupResponse;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.project.auth.entity.AuthProvider;
import com.project.auth.entity.RefreshToken;
import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.Base64;
import java.util.UUID;

@Service
public class UserAuthenticationService {

    private static final String ERROR_USER_NOT_FOUND = "error.auth.user_not_found";

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final TokenManagementService tokenManagementService;
    private final com.project.common.security.LoginAttemptService loginAttemptService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final PasswordEncoder passwordEncoder;

    public UserAuthenticationService(UserRepository userRepository, 
                                     AuthenticationManager authenticationManager, 
                                     TokenManagementService tokenManagementService, 
                                     com.project.common.security.LoginAttemptService loginAttemptService, 
                                     GoogleIdTokenVerifier googleIdTokenVerifier, 
                                     PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.tokenManagementService = tokenManagementService;
        this.loginAttemptService = loginAttemptService;
        this.googleIdTokenVerifier = googleIdTokenVerifier;
        this.passwordEncoder = passwordEncoder;
    }

    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress) {
        String email = request.getEmail();
        if (loginAttemptService.isAccountLocked(email)) {
            throw new org.springframework.security.authentication.LockedException("error.auth.account_locked");
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            loginAttemptService.loginFailed(email, ipAddress, "error.auth.bad_credentials");
            throw new BadCredentialsException("error.auth.bad_credentials");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(ERROR_USER_NOT_FOUND));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new DisabledException("error.auth.disabled");
        }

        // Nếu MFA được kích hoạt, ta không trả về token ngay mà yêu cầu bước 2
        if (user.isMfaEnabled()) {
             AuthResponse response = new AuthResponse();
             response.setMfaRequired(true);
             return response;
        }

        loginAttemptService.loginSucceeded(email, ipAddress);

        String jwtToken = tokenManagementService.generateAccessToken(user);
        RefreshToken refreshToken = tokenManagementService.createRefreshToken(user.getId());

        return new AuthResponse(jwtToken, refreshToken.getToken(), user.getRole().name(), user.getId());
    }

    @Transactional
    public AuthResponse verifyMfaAndLogin(String email, int code, String ipAddress) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(ERROR_USER_NOT_FOUND));

        if (!user.isMfaEnabled()) {
            throw new IllegalArgumentException("error.auth.mfa_not_enabled");
        }

        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        boolean isCodeValid = gAuth.authorize(user.getMfaSecret(), code);

        if (!isCodeValid) {
            loginAttemptService.loginFailed(email, ipAddress, "error.auth.mfa_invalid");
            throw new BadCredentialsException("error.auth.mfa_invalid");
        }

        loginAttemptService.loginSucceeded(email, ipAddress);

        String jwtToken = tokenManagementService.generateAccessToken(user);
        RefreshToken refreshToken = tokenManagementService.createRefreshToken(user.getId());

        return new AuthResponse(jwtToken, refreshToken.getToken(), user.getRole().name(), user.getId());
    }

    @Transactional
    public MfaSetupResponse generateMfaSecret(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(ERROR_USER_NOT_FOUND));
        
        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        final GoogleAuthenticatorKey key = gAuth.createCredentials();
        
        user.setMfaSecret(key.getKey());
        userRepository.save(user);
        
        String otpauthUri = String.format("otpauth://totp/PCeStore:%s?secret=%s&issuer=PCeStore", email, key.getKey());
        String qrCodeBase64 = generateQrCodeBase64(otpauthUri);

        return new MfaSetupResponse(key.getKey(), qrCodeBase64);
    }

    private String generateQrCodeBase64(String content) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 200, 200);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Could not generate QR code", e);
        }
    }

    @Transactional
    public void enableMfa(String email, int code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(ERROR_USER_NOT_FOUND));
        
        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        if (gAuth.authorize(user.getMfaSecret(), code)) {
            user.setMfaEnabled(true);
            userRepository.save(user);
        } else {
            throw new IllegalArgumentException("error.auth.mfa_invalid");
        }
    }

    @Transactional
    public AuthResponse googleLogin(String idTokenString, String ipAddress) {
        try {
            GoogleIdToken idToken = googleIdTokenVerifier.verify(idTokenString);
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

            loginAttemptService.loginSucceeded(email, ipAddress);

            String jwtToken = tokenManagementService.generateAccessToken(user);
            RefreshToken refreshToken = tokenManagementService.createRefreshToken(user.getId());

            return new AuthResponse(jwtToken, refreshToken.getToken(), user.getRole().name(), user.getId());

        } catch (GeneralSecurityException | IOException | IllegalArgumentException e) {
            loginAttemptService.logLoginAudit("UNKNOWN_GOOGLE", ipAddress, false, "error.auth.google_failed");
            throw new IllegalArgumentException("error.auth.google_failed", e);
        }
    }
}
