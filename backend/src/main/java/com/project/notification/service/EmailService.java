package com.project.notification.service;

import org.springframework.beans.factory.annotation.Value;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.context.MessageSource;
import java.util.Locale;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.context.annotation.Lazy;
import org.springframework.retry.annotation.Recover;
import com.project.notification.exception.NotificationException;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${custom.mail.from:noreply@pcestore.com}")
    private String fromEmail;

    @Value("${custom.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final Map<String, String> emailTemplates = new HashMap<>();
    private final MessageSource messageSource;
    private final NotificationService notificationService;

    public EmailService(JavaMailSender mailSender, MessageSource messageSource, @Lazy NotificationService notificationService) {
        this.mailSender = mailSender;
        this.messageSource = messageSource;
        this.notificationService = notificationService;
    }

    @PostConstruct
    public void initTemplates() {
        try {
            emailTemplates.put("verify-email-vi",
                    StreamUtils.copyToString(
                            new ClassPathResource("templates/email/verify-email-vi.html").getInputStream(),
                            StandardCharsets.UTF_8));
            emailTemplates.put("verify-email-en",
                    StreamUtils.copyToString(
                            new ClassPathResource("templates/email/verify-email-en.html").getInputStream(),
                            StandardCharsets.UTF_8));
            emailTemplates.put("reset-password-vi",
                    StreamUtils.copyToString(
                            new ClassPathResource("templates/email/reset-password-vi.html").getInputStream(),
                            StandardCharsets.UTF_8));
            emailTemplates.put("reset-password-en",
                    StreamUtils.copyToString(
                            new ClassPathResource("templates/email/reset-password-en.html").getInputStream(),
                            StandardCharsets.UTF_8));
            emailTemplates.put("order-confirm-vi",
                    StreamUtils.copyToString(
                            new ClassPathResource("templates/email/order-confirm-vi.html").getInputStream(),
                            StandardCharsets.UTF_8));
            emailTemplates.put("order-confirm-en",
                    StreamUtils.copyToString(
                            new ClassPathResource("templates/email/order-confirm-en.html").getInputStream(),
                            StandardCharsets.UTF_8));
            emailTemplates.put("order-status-vi",
                    StreamUtils.copyToString(
                            new ClassPathResource("templates/email/order-status-vi.html").getInputStream(),
                            StandardCharsets.UTF_8));
            emailTemplates.put("order-status-en",
                    StreamUtils.copyToString(
                            new ClassPathResource("templates/email/order-status-en.html").getInputStream(),
                            StandardCharsets.UTF_8));
            logger.info("Email templates loaded successfully into RAM cache.");
        } catch (java.io.IOException e) {
            throw new IllegalStateException("Mất file HTML Email! Dừng hệ thống.", e);
        }
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendVerificationEmail(String toEmail, String token, Locale locale, Long notifId) {
        try {
            String subject = messageSource.getMessage("email.subject.verify", null, locale);
            String link = frontendUrl + "/verify-email?token=" + token;
            
            String key = "verify-email-" + locale.getLanguage();
            String html = emailTemplates.getOrDefault(key, emailTemplates.get("verify-email-en"))
                    .replace("{{link}}", link)
                    .replace("{{token}}", token);

            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException | org.springframework.context.NoSuchMessageException e) {
            String msg = messageSource.getMessage("notification.error.send_verify", new Object[]{notifId}, locale);
            throw new NotificationException(msg, e);
        }
    }

    @Recover
    public void recoverVerificationEmail(NotificationException e, String toEmail, String token, Locale locale, Long notifId) {
        String logMsg = messageSource.getMessage("notification.error.exhausted_verify", new Object[]{notifId}, locale);
        logger.error(logMsg);
        notificationService.markAsFailed(notifId);
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendPasswordResetEmail(String toEmail, String token, Locale locale, Long notifId) {
        try {
            String subject = messageSource.getMessage("email.subject.pwd_reset", null, locale);
            String link = frontendUrl + "/reset-password?token=" + token;
            
            String key = "reset-password-" + locale.getLanguage();
            String html = emailTemplates.getOrDefault(key, emailTemplates.get("reset-password-en"))
                    .replace("{{link}}", link);

            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException | org.springframework.context.NoSuchMessageException e) {
            String msg = messageSource.getMessage("notification.error.send_pwd_reset", new Object[]{notifId}, locale);
            throw new NotificationException(msg, e);
        }
    }

    @Recover
    public void recoverPasswordResetEmail(NotificationException e, String toEmail, String token, Locale locale, Long notifId) {
        String logMsg = messageSource.getMessage("notification.error.exhausted_pwd_reset", new Object[]{notifId}, locale);
        logger.error(logMsg);
        notificationService.markAsFailed(notifId);
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendOrderConfirmationEmail(String toEmail, String username, String orderId, String totalAmount, Locale locale, Long notifId) {
        try {
            String subject = messageSource.getMessage("email.subject.order_confirm", new Object[]{orderId}, locale);
            String key = "order-confirm-" + locale.getLanguage();
            String html = emailTemplates.getOrDefault(key, emailTemplates.get("order-confirm-en"))
                    .replace("{{username}}", username)
                    .replace("{{orderId}}", orderId)
                    .replace("{{totalAmount}}", totalAmount);

            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException | org.springframework.context.NoSuchMessageException e) {
            String msg = messageSource.getMessage("notification.error.send_order_confirm", new Object[]{orderId, notifId}, locale);
            throw new NotificationException(msg, e);
        }
    }

    @Recover
    public void recoverOrderConfirmationEmail(NotificationException e, String toEmail, String username, String orderId, String totalAmount, Locale locale, Long notifId) {
        String logMsg = messageSource.getMessage("notification.error.exhausted_order_confirm", new Object[]{notifId}, locale);
        logger.error(logMsg);
        notificationService.markAsFailed(notifId);
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendOrderStatusUpdateEmail(String toEmail, String username, String orderId, String orderStatus, Locale locale, Long notifId) {
        try {
            String subject = messageSource.getMessage("email.subject.order_status", new Object[]{orderId}, locale);
            String key = "order-status-" + locale.getLanguage();
            String html = emailTemplates.getOrDefault(key, emailTemplates.get("order-status-en"))
                    .replace("{{username}}", username)
                    .replace("{{orderId}}", orderId)
                    .replace("{{orderStatus}}", orderStatus);

            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException | org.springframework.context.NoSuchMessageException e) {
            String msg = messageSource.getMessage("notification.error.send_order_status", new Object[]{orderId, notifId}, locale);
            throw new NotificationException(msg, e);
        }
    }

    @Recover
    public void recoverOrderStatusUpdateEmail(NotificationException e, String toEmail, String username, String orderId, String orderStatus, Locale locale, Long notifId) {
        String logMsg = messageSource.getMessage("notification.error.exhausted_order_status", new Object[]{notifId}, locale);
        logger.error(logMsg);
        notificationService.markAsFailed(notifId);
    }

    public void sendRawEmailSync(String toEmail, String subject, String htmlContent) {
        try {
            sendHtmlMail(toEmail, subject, htmlContent);
        } catch (MessagingException e) {
            logger.error("Failed to send sync email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendHtmlMail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
