import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy mã xác thực!');
      return;
    }
    
    // React Strict Mode might call useEffect twice, so we use useRef to avoid double API calls
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const verify = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        if (response.ok) {
          setStatus('success');
          setMessage('Email của bạn đã được xác thực thành công! Tài khoản đã được kích hoạt.');
        } else {
          try {
            const errorText = await response.text();
            setStatus('error');
            setMessage(errorText || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
          } catch(e) {
            setStatus('error');
            setMessage('Mã xác thực không hợp lệ hoặc đã hết hạn.');
          }
        }
      } catch (err) {
        setStatus('error');
        setMessage('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="card shadow-lg border-0 rounded-4 text-center p-5" style={{ width: '100%', maxWidth: '500px' }}>
        {status === 'loading' && (
          <div>
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <h4 className="fw-bold">Đang xác thực...</h4>
            <p className="text-muted">Vui lòng chờ trong giây lát để hệ thống kiểm tra</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
            <h4 className="fw-bold mt-3 text-success">Thành công!</h4>
            <p className="text-muted mt-2">{message}</p>
            <Link to="/login" className="btn btn-primary px-4 py-2 mt-3 rounded-pill fw-medium">
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
            <h4 className="fw-bold mt-3 text-danger">Xác thực thất bại!</h4>
            <p className="text-muted mt-2">{message}</p>
            <Link to="/login" className="btn btn-outline-secondary px-4 py-2 mt-3 rounded-pill fw-medium">
              Về trang đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
