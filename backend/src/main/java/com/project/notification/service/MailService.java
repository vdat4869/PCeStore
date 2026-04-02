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

@Service
public class MailService {

    private static final Logger logger = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    @Value("${custom.mail.from:noreply@pcestore.com}")
    private String fromEmail;

    @Value("${custom.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final Map<String, String> emailTemplates = new HashMap<>();
    private final MessageSource messageSource;

    public MailService(JavaMailSender mailSender, MessageSource messageSource) {
        this.mailSender = mailSender;
        this.messageSource = messageSource;
    }

    @PostConstruct
    public void initTemplates() {
        try {
            emailTemplates.put("verify-email-vi", StreamUtils.copyToString(new ClassPathResource("templates/email/verify-email-vi.html").getInputStream(), StandardCharsets.UTF_8));
            emailTemplates.put("verify-email-en", StreamUtils.copyToString(new ClassPathResource("templates/email/verify-email-en.html").getInputStream(), StandardCharsets.UTF_8));
            emailTemplates.put("reset-password-vi", StreamUtils.copyToString(new ClassPathResource("templates/email/reset-password-vi.html").getInputStream(), StandardCharsets.UTF_8));
            emailTemplates.put("reset-password-en", StreamUtils.copyToString(new ClassPathResource("templates/email/reset-password-en.html").getInputStream(), StandardCharsets.UTF_8));
            logger.info("Email templates loaded successfully into RAM cache.");
        } catch (java.io.IOException e) {
            throw new IllegalStateException("Mất file HTML Email! Dừng hệ thống.", e);
        }
    }

    @Async
    public void sendVerificationEmail(String toEmail, String token, Locale locale) {
        String subject = messageSource.getMessage("email.subject.verify", null, locale);
        String link = frontendUrl + "/verify-email?token=" + token;
        
        String key = "verify-email-" + locale.getLanguage();
        String html = emailTemplates.getOrDefault(key, emailTemplates.get("verify-email-en"))
                .replace("{{link}}", link)
                .replace("{{token}}", token);

        sendHtmlMail(toEmail, subject, html);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String token, Locale locale) {
        String subject = messageSource.getMessage("email.subject.pwd_reset", null, locale);
        String link = frontendUrl + "/reset-password?token=" + token;
        
        String key = "reset-password-" + locale.getLanguage();
        String html = emailTemplates.getOrDefault(key, emailTemplates.get("reset-password-en"))
                .replace("{{link}}", link);

        sendHtmlMail(toEmail, subject, html);
    }

    private void sendHtmlMail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MailException | MessagingException e) {
            logger.error("Gửi email HTML thất bại: {}", e.getMessage(), e);
        }
    }
}
