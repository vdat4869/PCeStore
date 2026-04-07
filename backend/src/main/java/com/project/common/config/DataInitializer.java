package com.project.common.config;

import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, 
                                      PasswordEncoder passwordEncoder,
                                      JdbcTemplate jdbcTemplate) {
        return args -> {
            // 1. Cleanup: Sửa các bản ghi Notification bị lỗi is_read = NULL (Do Hibernate ddl-auto thêm cột vào bảng có sẵn dữ liệu)
            try {
                logger.info("Cleaning up Notifications data (is_read column)...");
                int updatedRows = jdbcTemplate.update("UPDATE notifications SET is_read = false WHERE is_read IS NULL");
                if (updatedRows > 0) {
                    logger.info("✅ Fixed {} rows in notifications table.", updatedRows);
                }
            } catch (Exception e) {
                logger.warn("Could not cleanup notifications table (it might not exist yet): {}", e.getMessage());
            }

            // 2. Initialize Admin
            String adminEmail = "admin123@gmail.com";
            
            if (!userRepository.existsByEmail(adminEmail)) {
                logger.info("Initializing default Admin account...");
                
                String adminPassword = "Admin@123";
                User admin = new User(
                        adminEmail,
                        passwordEncoder.encode(adminPassword),
                        UserRole.ADMIN,
                        UserStatus.ACTIVE
                );
                admin.setFullName("System Admin");
                
                userRepository.save(admin);
                
                logger.info("✅ Default Admin account created successfully!");
                logger.info("Email: {}", adminEmail);
                logger.info("Password fixed: {}", adminPassword);
            } else {
                logger.info("Admin account already exists.");
            }
        };
    }
}
