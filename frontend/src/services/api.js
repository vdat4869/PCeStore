import axios from 'axios';

// Cấu hình Axios cơ bản để gọi API tới Backend
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Chỉnh sửa URL Backend tại đây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: tự động đính kèm JWT token vào mọi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: tự động xử lý khi nhận được phản hồi lỗi từ Backend
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu nhận lỗi 401 (Unauthorized) - Token hết hạn hoặc sai
    if (error.response && error.response.status === 401) {
      console.warn('Xác thực thất bại (401). Đang đăng xuất...');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdminAuthenticated');
      // Tùy chọn: Tự động chuyển hướng về trang login hoặc reload trang
      if (!window.location.pathname.includes('/login')) {
        window.location.reload(); 
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
