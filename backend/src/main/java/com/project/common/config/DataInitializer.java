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
    private final com.project.support.repository.ComplaintRepository complaintRepository;

    public DataInitializer(CategoryRepository categoryRepository, com.project.support.repository.ComplaintRepository complaintRepository) {
        this.categoryRepository = categoryRepository;
        this.complaintRepository = complaintRepository;
    }

    @Override
    public void run(String... args) {
        // Init Categories
        List<String> defaultCategoryNames = Arrays.asList(
            "CPU", "Mainboard", "RAM", "VGA", "SSD", "HDD", "Nguồn", "Case", "Tản nhiệt", "Màn hình",
            "Laptop", "Bàn phím", "Chuột", "Tai nghe", "Thiết bị mạng", "Máy In, UPS", "Camera"
        );

        for (String name : defaultCategoryNames) {
            if (!categoryRepository.existsByName(name)) {
                categoryRepository.save(new Category(null, name));
            }
        }
        
        // Init Complaints if empty
        if (complaintRepository.count() == 0) {
            complaintRepository.save(new com.project.support.entity.Complaint(1L, "Nguyễn Văn An", "Lỗi VGA bị crash"));
            complaintRepository.save(new com.project.support.entity.Complaint(2L, "Trần Thị Bé", "Giao hàng chậm 2 ngày"));
        }
    }
}
