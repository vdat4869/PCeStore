package com.project.auth.controller;

import com.project.auth.dto.AuthResponse;
import com.project.auth.dto.LoginRequest;
import com.project.auth.dto.RefreshTokenRequest;
import com.project.auth.dto.RegisterRequest;
import com.project.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final MessageSource messageSource;

    public AuthController(AuthService authService, MessageSource messageSource) {
        this.authService = authService;
        this.messageSource = messageSource;
    }

    private String translate(String key) {
        try {
            return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
        } catch (org.springframework.context.NoSuchMessageException e) {
            return key;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(translate(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication authentication) {
        // Lấy thông tin email từ Authentication context mà JWT mang lại hợp lệ
        if (authentication != null && authentication.getName() != null) {
            authService.logout(authentication.getName());
            return ResponseEntity.ok(translate("success.auth.logout"));
        }
        throw new IllegalArgumentException("error.auth.not_logged_in");
    }
}
