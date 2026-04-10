package com.project.common.config;

import com.project.product.entity.Category;
import com.project.product.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        // Tự động thêm một số danh mục mẫu nếu database đang trống
        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = Arrays.asList(
                new Category(null, "CPU - Bộ vi xử lý"),
                new Category(null, "VGA - Card màn hình"),
                new Category(null, "Mainboard - Bo mạch chủ"),
                new Category(null, "RAM - Bộ nhớ trong"),
                new Category(null, "SSD/HDD - Ổ cứng"),
                new Category(null, "PSU - Nguồn máy tính"),
                new Category(null, "Case - Vỏ máy tính"),
                new Category(null, "Monitor - Màn hình")
            );
            categoryRepository.saveAll(defaultCategories);
            System.out.println(">> Đã khởi tạo danh mục sản phẩm mẫu thành công.");
        }
    }
}
