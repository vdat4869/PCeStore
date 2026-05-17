import axios from 'axios';

// Cấu hình Axios cơ bản để gọi API tới Backend
const apiClient = axios.create({
  baseURL: 'https://pcestore.onrender.com/api', // Chỉnh sửa URL Backend tại đây
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor: tự động xử lý khi nhận được phản hồi lỗi từ Backend
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu nhận lỗi 401 (Unauthorized) - Token hết hạn hoặc sai
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.warn('Không có refresh token, đang đăng xuất...');
        return forceLogout(error);
      }

      try {
        const payload = { token: refreshToken };
        const response = await axios.post('https://pcestore.onrender.com/api/auth/refresh-token', payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;
        
        const role = localStorage.getItem('userRole');
        if (role === 'ADMIN' || role === 'EMPLOYEE') {
            localStorage.setItem('adminToken', newAccessToken);
        } else {
            localStorage.setItem('userToken', newAccessToken);
        }
        localStorage.setItem('refreshToken', newRefreshToken);
        
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        
        processQueue(null, newAccessToken);
        isRefreshing = false;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token thất bại:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        return forceLogout(error);
      }
    }
    return Promise.reject(error);
  }
);

function forceLogout(error) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('userRole');
    if (!window.location.pathname.includes('/login')) {
      window.location.reload(); 
    }
    return Promise.reject(error);
}

export default apiClient;
