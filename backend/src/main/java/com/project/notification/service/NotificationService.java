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
    public void sendOrderConfirmation(User user, String orderId, String totalAmount, Locale locale) {
        String content = messageSource.getMessage("notification.order_confirm.content", new Object[]{orderId}, locale);
        Notification notif = new Notification(user, NotificationType.ORDER_CONFIRMATION, content);
        notif = notificationRepository.save(notif);
        String username = user.getFullName() != null ? user.getFullName() : user.getEmail();
        emailService.sendOrderConfirmationEmail(user.getEmail(), username, orderId, totalAmount, locale, notif.getId());
    }

    @Transactional
    public void sendOrderStatusUpdate(User user, String orderId, String status, Locale locale) {
        String content = messageSource.getMessage("notification.order_status.content", new Object[]{orderId, status}, locale);
        Notification notif = new Notification(user, NotificationType.ORDER_STATUS_UPDATE, content);
        notif = notificationRepository.save(notif);
        String username = user.getFullName() != null ? user.getFullName() : user.getEmail();
        emailService.sendOrderStatusUpdateEmail(user.getEmail(), username, orderId, status, locale, notif.getId());
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
        if (failedNotifs.isEmpty()) {
            return;
        }
        logger.warn("[AUTO-HEALING] Phát hiện {} thư thất bại trong DB. Bắt đầu khôi phục...", failedNotifs.size());
        
        for (Notification n : failedNotifs) {
            try {
                String fallbackHtml = "<div style=\"font-family: Arial, sans-serif; padding: 20px;\"><h3 style=\"color: #e53935;\">Thông báo quan trọng / Important Notice</h3><p>" 
                        + n.getContent() 
                        + "</p><hr/><p style=\"font-size: 12px; color: #999;\">PCeStore Automated Fallback System</p></div>";
                emailService.sendRawEmailSync(n.getUser().getEmail(), "PCeStore Notification Fallback", fallbackHtml);
                
                n.setStatus(NotificationStatus.SENT);
                n.setSentAt(LocalDateTime.now());
                notificationRepository.save(n);
                logger.info("[AUTO-HEALING] Đã phục hồi và gửi thành công thư ID: {}", n.getId());
            } catch (Exception e) {
                logger.error("[AUTO-HEALING] Không thể khôi phục thư ID: {} - Lỗi: {}", n.getId(), e.getMessage());
            }
        }
    }
}
