import axios from 'axios';

// Cấu hình Axios cơ bản để gọi API tới Backend
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Chỉnh sửa URL Backend tại đây
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
