# 🖥️ PC Components eCommerce System

## 📌 Giới thiệu
PC Components eStore là hệ thống thương mại điện tử chuyên cung cấp các linh kiện máy tính như CPU, GPU, RAM, SSD và các thiết bị phần cứng khác.

Hệ thống hỗ trợ đầy đủ quy trình mua sắm online:
- Duyệt sản phẩm
- Thêm vào giỏ hàng
- Thanh toán
- Giao hàng
- Đánh giá sản phẩm

---

## 🎯 Mục tiêu hệ thống
- Xây dựng nền tảng bán linh kiện PC trực tuyến
- Tối ưu trải nghiệm người dùng
- Đảm bảo tính toàn vẹn và chính xác dữ liệu
- Có khả năng mở rộng lên kiến trúc microservices

---

## ⚙️ Công nghệ sử dụng

### Backend
- Java (Spring Boot)
- RESTful API
- Spring Security + JWT

### Frontend
- ReactJS
- Axios
- Context API / Redux

### Database
- PostgreSQL

---

## 🏗️ Kiến trúc hệ thống

Hệ thống sử dụng:

> **Modular Monolithic Architecture**

Các module được tách biệt logic, có thể dễ dàng migrate sang microservices trong tương lai.

---

## 📦 Các module chính

### 1. Authentication Module
- Đăng ký / đăng nhập
- JWT authentication
- Phân quyền (Admin / Employee / Customer)

---

### 2. User Module
- Quản lý thông tin người dùng
- Địa chỉ giao hàng
- Lịch sử hoạt động

---

### 3. Product Module
- Quản lý sản phẩm (CPU, GPU, RAM…)
- Danh mục sản phẩm
- Thông số kỹ thuật
- Hình ảnh sản phẩm

---

### 4. Inventory Module (Kho)
- Quản lý số lượng tồn kho
- Cập nhật khi đặt hàng
- Tránh overselling

---

### 5. Cart Module
- Thêm / xóa / cập nhật sản phẩm
- Tính tổng tiền

---

### 6. Order Module
- Tạo đơn hàng
- Hủy đơn hàng
- Lịch sử đơn hàng
- Trạng thái đơn (pending, shipped, completed)

---

### 7. Payment Module
- Xử lý thanh toán (mock / VNPay / PayPal)
- Trạng thái thanh toán
- Lưu lịch sử giao dịch

---

### 8. Shipping Module
- Địa chỉ giao hàng
- Tính phí vận chuyển
- Theo dõi trạng thái giao hàng

---

### 9. Review Module
- Đánh giá sản phẩm (rating 1–5 sao)
- Bình luận
- Gắn với user + product

---

### 10. Notification Module (Optional)
- Gửi email xác nhận đơn hàng
- Thông báo trạng thái đơn

---

## 📂 Cấu trúc thư mục

## 🔹 Backend (Spring Boot)

```
backend/
├── src/main/java/com/project/
│   ├── auth/                # Xác thực & phân quyền
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── user/                # Quản lý người dùng
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── product/             # Quản lý sản phẩm
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── inventory/           # Quản lý tồn kho
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── cart/                # Giỏ hàng
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── order/               # Đơn hàng
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── payment/             # Thanh toán
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── shipping/            # Giao hàng
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── review/              # Đánh giá sản phẩm
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── notification/        # Thông báo (optional)
│   │   ├── service/
│   │   └── utils/
│   │
│   ├── common/              # Dùng chung toàn hệ thống
│   │   ├── config/          # Cấu hình (CORS, Swagger...)
│   │   ├── security/        # JWT filter, auth config
│   │   ├── exception/       # Global exception handler
│   │   ├── utils/           # Helper functions
│   │   └── constant/        # Enum, constant
│   │
│   └── Application.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── data.sql
│   └── schema.sql
│
└── pom.xml
```

### 🔹 Frontend (ReactJS)

```
frontend/
├── src/
│   ├── components/          # UI components (Button, Card...)
│   ├── pages/               # Các trang chính
│   │   ├── Home/
│   │   ├── Product/
│   │   ├── Cart/
│   │   ├── Login/
│   │   └── Profile/
│   │
│   ├── services/            # Gọi API (Axios)
│   ├── store/               # State management
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Helper functions
│   └── App.jsx
│
├── public/
└── package.json
```

---

## 🚀 Chức năng hệ thống

### 👤 Guest
- Xem sản phẩm
- Tìm kiếm, lọc
- Xem chi tiết sản phẩm
- Đăng ký tài khoản

---

### 🧑‍💻 Customer
- Quản lý giỏ hàng
- Đặt hàng
- Thanh toán
- Theo dõi đơn hàng
- Đánh giá sản phẩm

---

### 🛠️ Admin
- Quản lý sản phẩm
- Quản lý người dùng
- Quản lý đơn hàng
- Thống kê báo cáo

---

### 👨‍🔧 Employee
- Xử lý đơn hàng
- Cập nhật trạng thái giao hàng

---

## 🔐 Yêu cầu phi chức năng

### Performance
- Response < 3s
- Hỗ trợ concurrent users

### Security
- JWT authentication
- Bcrypt password hashing
- Role-based access control

### Reliability
- Transaction cho order
- Kiểm soát race condition

---


## 👥 Phân công

| Thành viên | Module |
|-----------|--------|
| Nguyễn Viết Đạt | Auth + User |
| Nguyễn Đăng Thịnh | Product + Inventory |
| Hoàng Hữu Nghĩa | Order + Payment |
| Võ Trần Ngọc Anh | UI |
| Đặng Ngọc Anh Đức | Integration |

---

## 🔮 Hướng phát triển
- Tích hợp thanh toán thật (VNPay, PayPal)
- Recommendation system
- Microservices architecture
- Mobile app

---