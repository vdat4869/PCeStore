package com.project.auth.controller;

import com.project.auth.dto.*;
import com.project.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import com.project.common.util.IpAddressUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = IpAddressUtil.getClientIpAddress(httpRequest);
        AuthResponse response = authService.login(request, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication authentication, HttpServletRequest request) {
        if (authentication != null && authentication.getName() != null) {
            String jwt = request.getHeader("Authorization");
            String message = authService.logout(authentication.getName(), jwt);
            return ResponseEntity.ok(message);
        }
        throw new IllegalArgumentException("error.auth.not_logged_in");
    }

    @PostMapping("/logout-all")
    public ResponseEntity<String> logoutAll(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            String message = authService.logoutAllDevices(authentication.getName());
            return ResponseEntity.ok(message);
        }
        throw new IllegalArgumentException("error.auth.not_logged_in");
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request.getToken()));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestParam String email) {
        return ResponseEntity.ok(authService.resendVerificationEmail(email));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request.getToken(), request.getNewPassword()));
    }

    @PostMapping("/google-login")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = IpAddressUtil.getClientIpAddress(httpRequest);
        return ResponseEntity.ok(authService.googleLogin(request.getIdToken(), ipAddress));
    }
}
