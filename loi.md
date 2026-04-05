# Lỗi khởi động Spring Boot: Unable to determine Dialect without JDBC metadata

## 1. Mô tả lỗi
Khi chạy ứng dụng Spring Boot bằng lệnh `mvn spring-boot:run` (hoặc khởi động từ class Main), màn hình terminal xuất hiện lỗi sau:
```
Caused by: org.hibernate.HibernateException: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)
```

## 2. Nguyên nhân
Lỗi này xảy ra khi **Hibernate** (thành phần quản lý cơ sở dữ liệu của Spring Boot) không thể kết nối tới Database (PostgreSQL) thông qua Driver JDBC. 

Cụ thể, ứng dụng đã được thiết lập để tự động đọc thông tin `username` và `password` từ biến môi trường (File `.env`) ứng với `application.yml` như sau:
```yaml
datasource:
  url: jdbc:postgresql://localhost:5432/pcestore
  username: ${DB_USERNAME:}
  password: ${DB_PASSWORD:}
```
Tuy nhiên, cấu hình bảo mật này không tồn tại do **file `.env` trong thư mục `backend` chưa được tạo hoặc chưa có thông tin database**. Điều đó làm cho `username` và `password` bị trống rỗng, và việc đăng nhập vào Database PostgreSQL mặc định bị từ chối trước khi Hibernate kịp lấy thông tin Schema / Dialect, dẫn tới việc văng exception.

## 3. Cách khắc phục
Chúng ta cần phải tạo file `.env` chứa đầy đủ cấu hình bảo mật ở root của project backend (cùng cấp với thư mục `src` và file `pom.xml`).

**Bước 1**: Tạo file `d:\PCeStore\backend\.env`.
**Bước 2**: Bổ sung nội dung thông tin kết nối DB cho chính xác với môi trường local của bạn, điển hình như sau:

```env
# Database Credentials
DB_USERNAME=postgres
DB_PASSWORD=123456
```

*(Lưu ý: Thay thế `123456` bằng mật khẩu thực tế bạn dùng cho trình quản trị pgAdmin / PostgreSQL của mình).*

**Bước 3 (Tuỳ chọn bổ sung)**: 
Cũng có thể điền thêm các cài đặt bảo mật cho hệ thống mà `application.yml` đang đòi hỏi như mã Secret của JWT Token hay Google OAuth2:
```env
JWT_SECRET_KEY=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION=900000
SEPAY_MERCHANT_ID=sandbox_merchant
# ...
```

**Bước 4**: Run lại `mvn spring-boot:run`, lúc này file `.env` sẽ được dependency `springboot3-dotenv` quét và map giá trị ứng với file cấu hình của Spring, lỗi sẽ được giải quyết trơn tru.
