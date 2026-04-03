package com.project.notification.service;

import com.project.auth.entity.User;
import com.project.notification.dto.NotificationResponse;
import com.project.notification.entity.Notification;
import com.project.notification.entity.NotificationStatus;
import com.project.notification.entity.NotificationType;
import com.project.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.MessageSource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final MessageSource messageSource;

    public NotificationService(NotificationRepository notificationRepository, 
                               EmailService emailService,
                               MessageSource messageSource) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.messageSource = messageSource;
    }

    public List<NotificationResponse> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(n -> new NotificationResponse(n.getId(), n.getType(), n.getContent(), n.getStatus(), n.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void sendVerification(User user, String token, Locale locale) {
        String content = messageSource.getMessage("notification.verification.content", null, locale);
        Notification notif = new Notification(user, NotificationType.EMAIL_VERIFICATION, content);
        notif = notificationRepository.save(notif);
        emailService.sendVerificationEmail(user.getEmail(), token, locale, notif.getId());
    }

    @Transactional
    public void sendPasswordReset(User user, String token, Locale locale) {
        String content = messageSource.getMessage("notification.pwd_reset.content", null, locale);
        Notification notif = new Notification(user, NotificationType.PASSWORD_RESET, content);
        notif = notificationRepository.save(notif);
        emailService.sendPasswordResetEmail(user.getEmail(), token, locale, notif.getId());
    }

    @Transactional
    public void markAsSent(Long notifId) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            n.setStatus(NotificationStatus.SENT);
            n.setSentAt(LocalDateTime.now());
            notificationRepository.save(n);
            logger.info("[NOTIFICATION] Mail gửi thành công ID: {}", notifId);
        });
    }

    @Transactional
    public void markAsFailed(Long notifId) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            n.setStatus(NotificationStatus.FAILED);
            notificationRepository.save(n);
            logger.error("[NOTIFICATION] Mail gửi THẤT BẠI ID: {}", notifId);
        });
    }

    // Auto-Healing System Alert
    @Scheduled(cron = "0 0 2 * * ?") // Mỗi ngày 02:00 AM quyét những thư lag hỏng
    public void sweepFailedNotifications() {
        List<Notification> failedNotifs = notificationRepository.findByStatus(NotificationStatus.FAILED);
        logger.warn("[AUTO-HEALING] Phát hiện {} thư thất bại trong DB.", failedNotifs.size());
    }
}
