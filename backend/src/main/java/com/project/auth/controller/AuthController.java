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
        try {
            return ResponseEntity.ok(translate(authService.register(request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(translate(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            String translatedPrefix = translate("error.auth.login_failed");
            return ResponseEntity.badRequest().body(translatedPrefix.replace("{0}", translate(e.getMessage())));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(translate(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        // Lấy thông tin email từ Authentication context mà JWT mang lại hợp lệ
        if (authentication != null && authentication.getName() != null) {
            authService.logout(authentication.getName());
            return ResponseEntity.ok(translate("success.auth.logout"));
        }
        return ResponseEntity.badRequest().body(translate("error.auth.not_logged_in"));
    }
}
