package com.project.common.util;

import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import com.project.product.entity.Category;
import com.project.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Tệp hỗ trợ khởi tạo dữ liệu mẫu và dọn dẹp Database cũ.
 */
@Component
@RequiredArgsConstructor
public class TestDataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        // 0. Xóa cột 'stock' cũ trong DB nếu còn tồn tại để tránh lỗi Not-Null
        // constraint
        try {
            jdbcTemplate.execute("ALTER TABLE products DROP COLUMN IF EXISTS stock");
            System.out.println(">>> Đã dọn dẹp cột 'stock' cũ thành công!");
        } catch (Exception e) {
            System.out
                    .println(">>> Lưu ý: Cột 'stock' có thể đã được xóa hoặc không thể xóa tự động: " + e.getMessage());
        }

        // 1. Khởi tạo Category nếu trống
        if (categoryRepository.count() == 0) {
            Category cat = Category.builder()
                    .name("Linh kiện PC")
                    .build();
            categoryRepository.save(cat);
            System.out.println(">>> Đã tạo Category mẫu: Linh kiện PC (ID: 1)");
        }

        // 2. Khởi tạo Admin nếu trống
        if (userRepository.findByEmail("admin@pcstore.com").isEmpty()) {
            User admin = new User(
                    "admin@pcstore.com",
                    passwordEncoder.encode("Admin@123"),
                    UserRole.ADMIN,
                    UserStatus.ACTIVE);
            admin.setFullName("Quản trị viên hệ thống");
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println(">>> Đã tạo tài khoản Admin mẫu: admin@pcstore.com / Admin@123");
        }
    }
}
