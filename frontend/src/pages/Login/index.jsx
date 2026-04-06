import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        setError('');

        if (data.role === 'ADMIN') {
          // Token cho Admin
          localStorage.setItem('adminToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('isAdminAuthenticated', 'true');
          localStorage.setItem('userRole', data.role);
          window.location.href = '/admin';
        } else if (data.role === 'EMPLOYEE') {
          // Token cho Nhân Viên
          localStorage.setItem('adminToken', data.accessToken); 
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('isAdminAuthenticated', 'true'); // Dùng guard của Admin tạm
          localStorage.setItem('userRole', data.role);
          window.location.href = '/employee';
        } else {
          // Token cho User Khách hàng (Về giao diện gốc)
          localStorage.setItem('userToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.removeItem('isAdminAuthenticated'); 
          window.location.href = '/';
        }
      } else {
        setError('Email hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối tới máy chủ. Vui lòng kiểm tra Backend có đang chạy không!');
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1" style={{ color: '#2b3452' }}>Đăng nhập</h2>
            <p className="text-muted small">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="email">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control bg-light border-start-0 ps-0"
                  id="email"
                  placeholder="Nhập Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary small fw-medium" htmlFor="password">Mật khẩu</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type="password"
                  className="form-control bg-light border-start-0 ps-0"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4 form-check">
              <input type="checkbox" className="form-check-input shadow-none" id="remember" />
              <label className="form-check-label small text-muted" htmlFor="remember">Nhớ tài khoản</label>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-medium">
              Đăng nhập
            </button>

            <div className="text-center mt-4 pt-2 border-top">
              <p className="small text-muted mb-2">
                Chưa có tài khoản? <Link to="/register" className="text-decoration-none fw-semibold text-danger">Đăng ký ngay</Link>
              </p>
              <Link to="/forgot-password" className="text-decoration-underline small text-muted">Quên mật khẩu?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
