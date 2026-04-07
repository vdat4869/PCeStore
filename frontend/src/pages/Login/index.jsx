import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
        // Cập nhật token và xác thực thông qua AuthContext
        login(data.accessToken, { email });
        setError('');
        navigate('/admin');
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
                  placeholder="admin123@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between">
                <label className="form-label text-secondary small fw-medium" htmlFor="password">Mật khẩu</label>
                <a href="#" className="text-decoration-none small" style={{ color: '#0d6efd' }}>Quên mật khẩu?</a>
              </div>
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
              <p className="small text-muted mb-0">
                Chưa có tài khoản? <Link to="/signup" className="text-decoration-none fw-semibold">Đăng ký ngay</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
