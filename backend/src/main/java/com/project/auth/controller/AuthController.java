package com.project.auth.controller;

import com.project.auth.dto.*;
import com.project.auth.service.*;
import com.project.common.util.IpAddressUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final UserRegistrationService registrationService;
    private final UserAuthenticationService authenticationService;
    private final PasswordService passwordService;
    private final TokenManagementService tokenManagementService;

    public AuthController(UserRegistrationService registrationService,
                          UserAuthenticationService authenticationService,
                          PasswordService passwordService,
                          TokenManagementService tokenManagementService) {
        this.registrationService = registrationService;
        this.authenticationService = authenticationService;
        this.passwordService = passwordService;
        this.tokenManagementService = tokenManagementService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        registrationService.register(request);
        return ResponseEntity.ok("success.auth.register_verify");
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestBody VerifyEmailRequest request) {
        registrationService.verifyEmail(request.getToken());
        return ResponseEntity.ok("success.auth.email_verified");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestParam String email) {
        registrationService.resendVerificationEmail(email);
        return ResponseEntity.ok("success.auth.verification_sent");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = IpAddressUtil.getClientIpAddress(httpRequest);
        AuthResponse response = authenticationService.login(request, ipAddress);
        
        if (response.isMfaRequired()) {
            return ResponseEntity.accepted().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mfa/verify-login")
    public ResponseEntity<AuthResponse> verifyMfaLogin(@Valid @RequestBody VerifyMfaRequest request, HttpServletRequest httpRequest) {
        String ipAddress = IpAddressUtil.getClientIpAddress(httpRequest);
        AuthResponse response = authenticationService.verifyMfaAndLogin(request.getEmail(), request.getCode(), ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mfa/setup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MfaSetupResponse> setupMfa(Principal principal) {
        MfaSetupResponse response = authenticationService.generateMfaSecret(principal.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mfa/enable")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> enableMfa(Principal principal, @Valid @RequestBody EnableMfaRequest request) {
        authenticationService.enableMfa(principal.getName(), request.getOtp());
        return ResponseEntity.ok("success.auth.mfa_enabled");
    }

    @PostMapping("/google-login")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = IpAddressUtil.getClientIpAddress(httpRequest);
        AuthResponse response = authenticationService.googleLogin(request.getIdToken(), ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(tokenManagementService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, Principal principal) {
        // Invalidate JWT (Blacklist)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && !authHeader.isEmpty()) {
            tokenManagementService.invalidateToken(authHeader);
        }
        
        // Delete Refresh Tokens
        if (principal != null) {
            tokenManagementService.deleteRefreshTokensByEmail(principal.getName());
        }
        
        return ResponseEntity.ok("success.auth.logout");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        passwordService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("success.auth.forgot_password_sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("success.auth.password_reset_success");
    }

    @DeleteMapping("/account")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteAccount(Principal principal) {
        registrationService.deleteAccount(principal.getName());
        return ResponseEntity.ok("success.auth.account_deleted");
    }
}
