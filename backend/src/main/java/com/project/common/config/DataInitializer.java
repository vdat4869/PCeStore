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

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initAdminData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin123@gmail.com";
            
            if (!userRepository.existsByEmail(adminEmail)) {
                logger.info("Initializing default Admin account...");
                
                User admin = new User(
                        adminEmail,
                        passwordEncoder.encode("Admin123"),
                        UserRole.ADMIN,
                        UserStatus.ACTIVE
                );
                admin.setFullName("System Admin");
                
                userRepository.save(admin);
                
                logger.info("✅ Default Admin account created successfully!");
                logger.info("Email: {}", adminEmail);
                logger.info("Password: {}", "Admin123");
            } else {
                logger.info("Admin account already exists.");
            }
        };
    }
}
