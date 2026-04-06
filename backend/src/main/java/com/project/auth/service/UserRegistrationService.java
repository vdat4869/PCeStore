package com.project.auth.service;

import com.project.auth.dto.RegisterRequest;
import com.project.auth.entity.EmailVerificationToken;
import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.EmailVerificationTokenRepository;
import com.project.auth.repository.UserRepository;
import com.project.notification.service.NotificationService;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserRegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository emailTokenRepository;
    private final NotificationService notificationService;

    public UserRegistrationService(UserRepository userRepository, 
                                   PasswordEncoder passwordEncoder, 
                                   EmailVerificationTokenRepository emailTokenRepository, 
                                   NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailTokenRepository = emailTokenRepository;
        this.notificationService = notificationService;
    }

    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("error.auth.email_used");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                UserRole.CUSTOMER,
                UserStatus.INACTIVE
        );
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        // Tạo mã xác thực Email
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken(user, token, LocalDateTime.now().plusHours(24));
        emailTokenRepository.save(verificationToken);

        // Ghi nhận và Gửi thư
        notificationService.sendVerification(user, token, LocaleContextHolder.getLocale());
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.token_not_found"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            emailTokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("error.auth.token_expired");
        }

        User user = verificationToken.getUser();
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        emailTokenRepository.delete(verificationToken);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalArgumentException("error.auth.account_active");
        }

        emailTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken(user, token, LocalDateTime.now().plusHours(24));
        emailTokenRepository.save(verificationToken);

        notificationService.sendVerification(user, token, LocaleContextHolder.getLocale());
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));
        
        // Thực hiện soft-delete (nhờ @SQLDelete đã thêm vào User entity)
        userRepository.delete(user);
    }
}
