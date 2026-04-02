package com.project.auth.service;

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

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    public void initTemplates() {
        try {
            String verifyHtml = StreamUtils.copyToString(new ClassPathResource("templates/email/verify-email.html").getInputStream(), StandardCharsets.UTF_8);
            String resetHtml = StreamUtils.copyToString(new ClassPathResource("templates/email/reset-password.html").getInputStream(), StandardCharsets.UTF_8);
            emailTemplates.put("verify-email", verifyHtml);
            emailTemplates.put("reset-password", resetHtml);
            logger.info("Email templates loaded successfully into RAM cache.");
        } catch (Exception e) {
            logger.error("Lỗi không thể tải giao diện Email HTML: ", e);
        }
    }

    @Async
    public void sendVerificationEmail(String toEmail, String token) {
        String subject = "Xác nhận tài khoản PCeStore";
        String link = frontendUrl + "/verify-email?token=" + token;
        
        String html = emailTemplates.getOrDefault("verify-email", "")
                .replace("{{link}}", link)
                .replace("{{token}}", token);

        sendHtmlMail(toEmail, subject, html);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String token) {
        String subject = "Khôi phục mật khẩu PCeStore";
        String link = frontendUrl + "/reset-password?token=" + token;
        
        String html = emailTemplates.getOrDefault("reset-password", "")
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
