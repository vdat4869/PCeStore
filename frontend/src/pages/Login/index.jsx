import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // States for MFA
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleProcessLoginSuccess = (data) => {
    login(data.accessToken, data.role, { email, id: data.userId }, data.refreshToken);
    setError('');
    if (data.role === 'ADMIN') {
      window.location.href = '/admin';
    } else if (data.role === 'EMPLOYEE') {
      window.location.href = '/employee';
    } else {
      window.location.href = '/';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isMfaStep) {
        // Step 2: Verify MFA
        const response = await fetch('http://localhost:8080/api/auth/mfa/verify-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: parseInt(mfaCode, 10) })
        });
        
        if (response.ok) {
          const data = await response.json();
          handleProcessLoginSuccess(data);
        } else {
          setError('Mã xác thực không hợp lệ hoặc đã hết hạn.');
        }
        return;
      }

      // Step 1: Default Login
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.mfaRequired) {
          setIsMfaStep(true);
          setError('');
        } else {
          handleProcessLoginSuccess(data);
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
            <h2 className="fw-bold mb-1" style={{ color: '#2b3452' }}>{isMfaStep ? 'Xác thực 2 bước' : 'Đăng nhập'}</h2>
            <p className="text-muted small">
              {isMfaStep ? 'Nhập mã gồm 6 chữ số từ ứng dụng Authenticator' : 'Vui lòng đăng nhập để tiếp tục'}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {!isMfaStep ? (
              <>
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
                      type={showPassword ? "text" : "password"}
                      className="form-control bg-light border-start-0 border-end-0 ps-0"
                      id="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span 
                      className="input-group-text bg-light border-start-0" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                    </span>
                  </div>
                </div>

                <div className="mb-4 form-check">
                  <input type="checkbox" className="form-check-input shadow-none" id="remember" />
                  <label className="form-check-label small text-muted" htmlFor="remember">Nhớ tài khoản</label>
                </div>
              </>
            ) : (
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-medium" htmlFor="mfaCode">Mã OTP (6 số)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-shield-lock text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 ps-0 text-center fw-bold tracking-widest"
                      id="mfaCode"
                      placeholder="000000"
                      maxLength="6"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      required
                      autoFocus
                    />
                  </div>
                </div>
            )}

            <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-medium">
              {isMfaStep ? 'Xác minh Authenticator' : 'Đăng nhập'}
            </button>

            {!isMfaStep && (
              <>
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />
                  <span className="mx-3 text-muted small">hoặc</span>
                  <hr className="flex-grow-1" />
                </div>

                <div className="d-flex justify-content-center">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        const response = await fetch('http://localhost:8080/api/auth/google-login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ idToken: credentialResponse.credential })
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          handleProcessLoginSuccess(data);
                        } else {
                          setError('Đăng nhập Google thất bại từ máy chủ.');
                        }
                      } catch (err) {
                        setError('Lỗi kết nối khi đăng nhập Google.');
                      }
                    }}
                    onError={() => {
                      setError('Đăng nhập Google thất bại.');
                    }}
                    useOneTap
                    theme="outline"
                    width="100%"
                  />
                </div>
              </>
            )}

            {!isMfaStep ? (
              <div className="text-center mt-4 pt-2 border-top">
                <p className="small text-muted mb-2">
                  Chưa có tài khoản? <Link to="/register" className="text-decoration-none fw-semibold text-danger">Đăng ký ngay</Link>
                </p>
                <Link to="/forgot-password" className="text-decoration-underline small text-muted">Quên mật khẩu?</Link>
              </div>
            ) : (
              <div className="text-center mt-4 pt-2 border-top">
                <button type="button" className="btn btn-link text-decoration-none small" onClick={() => { setIsMfaStep(false); setMfaCode(''); }}>
                  Quay lại đăng nhập thường
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
