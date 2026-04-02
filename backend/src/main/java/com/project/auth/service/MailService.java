package com.project.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${custom.mail.from:noreply@pcestore.com}")
    private String fromEmail;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        // Trong môi trường thưc tế, token có thể ghép vào link http://localhost:8080/api/auth/verify?token=...
        // Hoặc gửi link cho frontend xử lý. Ở đây giả định FE có trang verify.
        String subject = "Xác nhận tài khoản PCeStore";
        String message = "Xin chào,\n\n"
                + "Vui lòng sử dụng mã xác nhận sau để kích hoạt tài khoản của bạn:\n\n"
                + token + "\n\n"
                + "Mã này sẽ hết hạn sau 24 giờ.\n\n"
                + "Cảm ơn,\nPCeStore Team";

        sendSimpleMail(toEmail, subject, message);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String subject = "Khôi phục mật khẩu PCeStore";
        String message = "Xin chào,\n\n"
                + "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã sau (hoặc link) để đặt lại:\n\n"
                + token + "\n\n"
                + "Mã này sẽ hết hạn sau 15 phút.\n\n"
                + "Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n\n"
                + "Cảm ơn,\nPCeStore Team";

        sendSimpleMail(toEmail, subject, message);
    }

    private void sendSimpleMail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            // Trong thực tế cần retry hoặc logging chi tiết
            System.err.println("Gửi email thất bại: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
