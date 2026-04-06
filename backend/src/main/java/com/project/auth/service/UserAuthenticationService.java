package com.project.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.project.auth.dto.AuthResponse;
import com.project.auth.dto.LoginRequest;
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

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.UUID;

@Service
public class UserAuthenticationService {

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
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

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

        return new AuthResponse(jwtToken, refreshToken.getToken());
    }

    @Transactional
    public AuthResponse verifyMfaAndLogin(String email, int code, String ipAddress) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

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

        return new AuthResponse(jwtToken, refreshToken.getToken());
    }

    @Transactional
    public String generateMfaSecret(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));
        
        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        final GoogleAuthenticatorKey key = gAuth.createCredentials();
        
        user.setMfaSecret(key.getKey());
        userRepository.save(user);
        
        // Trả về secret để FE tạo QR code hoặc hiển thị cho người dùng
        return key.getKey();
    }

    @Transactional
    public void enableMfa(String email, int code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));
        
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

            return new AuthResponse(jwtToken, refreshToken.getToken());

        } catch (GeneralSecurityException | IOException | IllegalArgumentException e) {
            loginAttemptService.logLoginAudit("UNKNOWN_GOOGLE", ipAddress, false, "error.auth.google_failed");
            throw new IllegalArgumentException("error.auth.google_failed", e);
        }
    }
}
