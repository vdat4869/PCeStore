package com.project.common.config;

import com.project.product.entity.Category;
import com.project.product.repository.CategoryRepository;
import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import com.project.user.entity.UserProfile;
import com.project.user.repository.UserProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final com.project.support.repository.ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final com.project.product.repository.ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CategoryRepository categoryRepository,
            com.project.support.repository.ComplaintRepository complaintRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            com.project.product.repository.ProductRepository productRepository,
            PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Init Categories
        List<String> defaultCategoryNames = Arrays.asList(
                "CPU", "Mainboard", "RAM", "VGA", "SSD", "HDD", "Nguồn", "Case", "Tản nhiệt", "Màn hình",
                "Laptop", "Bàn phím", "Chuột", "Tai nghe");

        for (String name : defaultCategoryNames) {
            if (!categoryRepository.existsByName(name)) {
                categoryRepository.save(new Category(null, name));
            }
        }

        // Init Sample Products if empty
        if (productRepository.count() == 0) {
            initSampleProducts();
        }

        // Init Complaints if empty
        if (complaintRepository.count() == 0) {
            complaintRepository.save(new com.project.support.entity.Complaint(1L, "Nguyễn Văn An", "Lỗi VGA bị crash"));
            complaintRepository
                    .save(new com.project.support.entity.Complaint(2L, "Trần Thị Bé", "Giao hàng chậm 2 ngày"));
        }

        // Init Admin Account if not exists
        String adminEmail = "admin@pcestore.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User(
                    adminEmail,
                    passwordEncoder.encode("Admin@123"),
                    UserRole.ADMIN,
                    UserStatus.ACTIVE);
            admin.setFullName("System Administrator");
            User savedAdmin = userRepository.save(admin);

            // Create profile
            UserProfile profile = new UserProfile(savedAdmin, "System Administrator", null, null);
            userProfileRepository.save(profile);
        }
    }

    private void initSampleProducts() {
        // CPU
        saveProduct("Intel Core i9-13900K", "Cấu trúc 24 nhân 32 luồng, xung nhịp lên tới 5.8GHz", new BigDecimal("15000000"), "Intel", "CPU", "https://nguyencongpc.vn/media/product/250-28609-intel-core-i9-13900k-tray.jpg");
        saveProduct("AMD Ryzen 9 7950X", "Hiệu năng đa nhân vượt trợ với 16 nhân 32 luồng", new BigDecimal("14500000"), "AMD", "CPU", "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTqFGEEPCVvYnOssv1zJHGTYKk5DG8ScEKsMVvSoi7skVPviXbzlc1T7IAZfInFfmM0C8VfffygP8jfXLn7GBDBSpX7rrqbEa8169Bdz-A&usqp=CAc");

        // Mainboard
        saveProduct("ASUS ROG Maximus Z790 Hero", "Mainboard cao cấp hỗ trợ DDR5 và PCIe 5.0", new BigDecimal("18500000"), "ASUS", "Mainboard", "https://product.hstatic.net/200000420363/product/mainboard-asus-rog-maximus-z790-hero-90mb1ci0-m0eay0-7_a63a229d040d425d93c7451897039802_master.jpg");
        saveProduct("MSI MPG X670E Carbon WiFi", "Thiết kế mạnh mẽ, tản nhiệt VRM tối ưu cho AM5", new BigDecimal("12500000"), "MSI", "Mainboard", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_BVsY4HC_oxgVHLpYsm18gbd_1BTPJWGBmQ&s");

        // RAM
        saveProduct("Corsair Vengeance RGB 32GB DDR5", "Kênh đôi 2x16GB Bus 6000MHz Black", new BigDecimal("4200000"), "Corsair", "RAM", "https://nguyencongpc.vn/media/product/26813-ram-corsair-vengeance-rgb-32gb-2x16gb-ddr5-bus-6000mhz-black-1.jpg");
        saveProduct("G.Skill Trident Z5 RGB 32GB DDR5", "Bus 5600MHz cực nhanh, LED RGB rực rỡ", new BigDecimal("4800000"), "G.Skill", "RAM", "https://nguyencongpc.vn/media/lib/22-05-2023/ramgskilltridentz5rgb32gb2x16gbddr55600mhz2.jpeg");

        // VGA
        saveProduct("ASUS ROG Strix RTX 4090", "Card đồ họa mạnh nhất thế giới hiện nay", new BigDecimal("55000000"), "ASUS", "VGA", "https://dlcdnwebimgs.asus.com/files/media/015AF38A-127E-4FA8-9700-6D92BB2760C1/v2/img/kv/pd.png");
        saveProduct("GIGABYTE AORUS RX 7900 XTX", "24GB GDDR6, hiệu năng gaming 4K đỉnh cao", new BigDecimal("32000000"), "GIGABYTE", "VGA", "https://www.gigabyte.com/FileUpload/Global/KeyFeature/2254/innergigabyteimages/kf-card.png");

        // SSD
        saveProduct("Samsung 990 Pro 1TB M.2", "Tốc độ đọc lên tới 7450 MB/s", new BigDecimal("3500000"), "Samsung", "SSD", "https://product.hstatic.net/200000420363/product/o-cung-ssd-samsung-990-pro-1tb-2_dedb3de418e44b5bbf7cf5cf39e81756_master.jpg");
        saveProduct("WD Black SN850X 1TB M.2", "Sự lựa chọn hàng đầu cho Game thủ", new BigDecimal("2800000"), "Western Digital", "SSD", "https://nguyencongpc.vn/media/product/250-25054-western-digital-black-sn850x-1tb.jpg");

        // HDD
        saveProduct("Seagate IronWolf 4TB", "Độ bền cao dành cho hệ thống NAS", new BigDecimal("2900000"), "Seagate", "HDD", "https://product.hstatic.net/200000456405/product/44501_o-cung-hdd-seagate-4tb-ironwolf-pro-7200rpm-st4000ne0025_ba63f67612b14b5585f7cd655e4bd0b1.jpeg");
        saveProduct("WD Red Plus 4TB", "Hoạt động 24/7 ổn định và êm ái", new BigDecimal("2700000"), "Western Digital", "HDD", "https://product.hstatic.net/200000320233/product/421_wd_red_plus_4tb_vcom_da3c0c6e37784c1e868214b2db12cbdb_1024x1024.jpg");

        // Nguồn
        saveProduct("Corsair RM850x 850W Gold", "Full Modular, tụ điện Nhật Bản 105 độ C", new BigDecimal("3600000"), "Corsair", "Nguồn", "https://bizweb.dktcdn.net/100/329/122/products/nguon-may-tinh-corsair-rm850x-850w-80-plus-gold-1-b4ca541f-210e-4e39-8f23-135005145d79.png?v=1743638171033");
        saveProduct("Seasonic Prime 1000W Platinum", "Chuẩn 80 Plus Platinum siêu tiết kiệm điện", new BigDecimal("6500000"), "Seasonic", "Nguồn", "https://tinhocanhphat.vn/media/product/38010_01.png");

        // Case
        saveProduct("NZXT H7 Elite Black", "Kính cường lực 3 mặt, sẵn 3 fan RGB", new BigDecimal("4500000"), "NZXT", "Case", "https://www.tncstore.vn/media/product/250-7368-vo-case-nzxt-h7-elite-black-1--1-.png");
        saveProduct("Lian Li PC-O11 Dynamic", "Thiết kế hầm hố, tối ưu cho tản nhiệt nước", new BigDecimal("3800000"), "Lian Li", "Case", "https://nguyencongpc.vn/media/lib/10-08-2022/vcaselian-lipc-o11-dynamic-miniblack3.jpeg");

        // Tản nhiệt
        saveProduct("Noctua NH-D15 Chromax.Black", "Vua tản nhiệt khí với hiệu năng cực đỉnh", new BigDecimal("2800000"), "Noctua", "Tản nhiệt", "https://product.hstatic.net/200000420363/product/tan_nhiet_cpu_noctua_nh-d15_chromax_black_air_cooling_4fa23370b45244a7b2c56d027be910fc_master.png");
        saveProduct("Corsair iCUE H150i Elite", "Tản nhiệt nước AIO 360mm hiệu ứng đẹp mắt", new BigDecimal("5200000"), "Corsair", "Tản nhiệt", "https://nguyencongpc.vn/media/product/20140-corsair-icue-h150i-elite-capellix-white-3.jpg");

        // Màn hình
        saveProduct("Dell UltraSharp U2723QE", "Màn hình IPS Black 4K độ chuẩn màu cao", new BigDecimal("15500000"), "Dell", "Màn hình", "https://nguyencongpc.vn/media/product/22956-m--n-h--nh-dell-ultrasharp-u2723qe-3.jpeg");
        saveProduct("LG UltraGear 27GP850-B", "Nano IPS 2K 180Hz chuyên dụng gaming", new BigDecimal("9800000"), "LG", "Màn hình", "https://nguyencongpc.vn/media/product/19737-lg-27gp850-b-4.jpg");

        // Laptop
        saveProduct("MacBook Pro 14 M3 Pro", "Chip M3 Pro mạnh mẽ, màn hình Liquid Retina XDR", new BigDecimal("48000000"), "Apple", "Laptop", "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_11_1_638344482098373514_macbook-pro-14-2023-m3-pro-max-den%20(1).jpg");
        saveProduct("ASUS ROG Zephyrus G14", "Laptop gaming mỏng nhẹ, hiệu năng vượt trội", new BigDecimal("35000000"), "ASUS", "Laptop", "https://bizweb.dktcdn.net/100/512/769/products/s-l1600-7-de92321a-56da-4f59-a3be-c79263849ead.jpg?v=1724308419693");

        // Bàn phím
        saveProduct("Keychron K2 V2 Hot-swap", "Bàn phím cơ không dây cho Mac & Windows", new BigDecimal("2200000"), "Keychron", "Bàn phím", "https://keychron.com.au/cdn/shop/files/Keychron-K2-hot-swappable-wireless-mechanical-keyboard-for-Mac-Windows-iOS-Gateron-switch-red-with-type-C-RGB-white-backlight-aluminum-frame.jpg?v=1754616836&width=1214");
        saveProduct("Razer BlackWidow V4 Pro", "LED RGB cực đẹp, switch phím mượt mà", new BigDecimal("5500000"), "Razer", "Bàn phím", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/357644/ban-phim-co-bluetooth-razer-blackwidow-v4-pro-75-den-1-638967440605822144-750x500.jpg");

        // Chuột
        saveProduct("Logitech G Pro X Superlight 2", "Siêu nhẹ, cảm biến HERO 2 đỉnh cao", new BigDecimal("3400000"), "Logitech", "Chuột", "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/c/h/chuot-gaming-logitech-pro-x-superlight-2-lightspeed-7.png");
        saveProduct("Razer DeathAdder V3 Pro", "Chuột gaming không dây tốc độ phản hồi 4KHz", new BigDecimal("3200000"), "Razer", "Chuột", "https://product.hstatic.net/200000722513/product/thumbchuot_acc1428f2df24917bbb963b7e16098ed_c67ceca043874fd69d778f62c28c63f4_master.png");

        // Tai nghe
        saveProduct("Sony WH-1000XM5", "Chống ồn chủ động tốt nhất thế giới", new BigDecimal("7500000"), "Sony", "Tai nghe", "https://cdn.tgdd.vn/Products/Images/54/313692/tai-nghe-bluetooth-chup-tai-sony-wh1000xm5-den-1-750x500.jpg");
        saveProduct("SteelSeries Arctis Nova Pro", "Tai nghe gaming không dây chuẩn Hi-Res", new BigDecimal("8500000"), "SteelSeries", "Tai nghe", "https://azaudio.vn/wp-content/uploads/2023/12/azaudio-steelseries-arctis-nova-pro-wireless.jpg");
    }

    private void saveProduct(String name, String desc, BigDecimal price, String brand, String catName, String imageUrl) {
        com.project.product.entity.Category cat = categoryRepository.findByName(catName)
                .orElseThrow(() -> new RuntimeException("Category not found: " + catName));
        
        com.project.product.entity.Product product = com.project.product.entity.Product.builder()
                .name(name)
                .description(desc)
                .price(price)
                .brand(brand)
                .category(cat)
                .imageUrl(imageUrl)
                .build();
        productRepository.save(product);
    }
}
