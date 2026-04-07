import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { cartCount } = useCart();
  const { isLoggedIn, logout } = useAuth();
  
  // Trạng thái đóng/mở menu (React-controlled)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  // Refs để xử lý click outside
  const categoryRef = useRef(null);
  const accountRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="shadow-sm sticky-top bg-white">
      {/* Top Bar */}
      <div className="bg-danger text-white py-1 d-none d-md-block">
        <div className="container d-flex justify-content-center justify-content-md-between align-items-center">
          <ul className="nav small">
            <li className="nav-item"><Link to="/khuyen-mai" className="nav-link text-white py-1 px-2"><i className="bi bi-gift me-1"></i>Khuyến mãi</Link></li>
            <li className="nav-item"><Link to="/tra-gop" className="nav-link text-white py-1 px-2"><i className="bi bi-credit-card me-1"></i>Trả góp</Link></li>
            <li className="nav-item"><Link to="/bang-gia" className="nav-link text-white py-1 px-2"><i className="bi bi-card-list me-1"></i>Bảng giá</Link></li>
            <li className="nav-item"><Link to="/build-pc" className="nav-link text-white py-1 px-2"><i className="bi bi-pc-display me-1"></i>Xây dựng cấu hình</Link></li>
            <li className="nav-item"><Link to="/bao-hanh" className="nav-link text-white py-1 px-2"><i className="bi bi-shield-check me-1"></i>Chính sách bảo hành</Link></li>
          </ul>
          <div className="small fw-bold">
            <i className="bi bi-telephone-fill me-1"></i> Hotline: 1900 0243
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white py-3 border-bottom">
        <div className="container">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-12 col-md-3 mb-3 mb-md-0 text-center text-md-start">
              <Link to="/">
                <img src="/src/admin/assets/images/logo-estore-removebg-preview.png" alt="PCeStore Logo" style={{ height: '45px', objectFit: 'contain' }} />
              </Link>
            </div>
            
            {/* Search Bar */}
            <div className="col-12 col-md-5 mb-3 mb-md-0">
              <div className="input-group" ref={categoryRef}>
                <button 
                  className={`btn btn-outline-secondary dropdown-toggle bg-light text-dark fw-medium ${isCategoryOpen ? 'show' : ''}`} 
                  type="button" 
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  <i className="bi bi-list me-1"></i> Danh mục
                </button>
                <ul className={`dropdown-menu shadow border-0 ${isCategoryOpen ? 'show' : ''}`} style={{ zIndex: 11000 }}>
                  <li><Link className="dropdown-item" to="/products?category=pc-gaming" onClick={() => setIsCategoryOpen(false)}>PC Gaming</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=pc-van-phong" onClick={() => setIsCategoryOpen(false)}>PC Văn Phòng</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/products?category=vga" onClick={() => setIsCategoryOpen(false)}>VGA - Card màn hình</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=cpu" onClick={() => setIsCategoryOpen(false)}>CPU - Vi xử lý</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=ram" onClick={() => setIsCategoryOpen(false)}>RAM - Bộ nhớ trong</Link></li>
                </ul>
                <input type="text" className="form-control" placeholder="Bạn tìm gì..." />
                <button className="btn btn-danger px-4" type="button">
                  <i className="bi bi-search"></i>
                </button>
              </div>
              <div className="small mt-1 text-muted d-none d-md-flex gap-3">
                <Link to="/search?q=VGA" className="text-decoration-none text-secondary">VGA</Link>
                <Link to="/search?q=CPU" className="text-decoration-none text-secondary">CPU AMD</Link>
                <Link to="/search?q=RAM" className="text-decoration-none text-secondary">RAM</Link>
                <Link to="/search?q=Màn hình" className="text-decoration-none text-secondary">Màn hình</Link>
              </div>
            </div>

            {/* Actions */}
            <div className="col-12 col-md-4 text-center text-md-end d-flex justify-content-center justify-content-md-end align-items-center gap-4">
              <div className="dropdown" ref={accountRef}>
                <button 
                  className={`btn border-0 d-flex align-items-center p-0 dropdown-toggle no-caret ${isAccountOpen ? 'show' : ''}`} 
                  type="button" 
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                >
                  <i className={`bi bi-person-circle fs-3 me-2 ${isLoggedIn ? 'text-primary' : ''}`} style={{ color: isLoggedIn ? '' : '#888', fontSize: '1.8rem' }}></i>
                  <div className="text-start small d-none d-lg-block">
                    <div className="text-muted" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                      {isLoggedIn ? 'Xin chào,' : 'Đăng nhập/Đăng ký'}
                    </div>
                    <div className="text-dark fw-bold" style={{ fontSize: '14px' }}>
                      Tài khoản <i className={`bi bi-caret-down-fill ${isLoggedIn ? '' : 'text-muted'}`} style={{ fontSize: '10px' }}></i>
                    </div>
                  </div>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${isAccountOpen ? 'show' : ''}`} style={{ zIndex: 11000 }}>
                  {isLoggedIn ? (
                    <>
                      <li><Link className="dropdown-item py-2" to="/profile" onClick={() => setIsAccountOpen(false)}><i className="bi bi-person me-2"></i>Thông tin cá nhân</Link></li>
                      <li><Link className="dropdown-item py-2" to="/orders" onClick={() => setIsAccountOpen(false)}><i className="bi bi-box-seam me-2"></i>Đơn hàng của tôi</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><button className="dropdown-item py-2 text-danger" onClick={() => { logout(); setIsAccountOpen(false); }}><i className="bi bi-box-arrow-right me-2"></i>Đăng xuất</button></li>
                    </>
                  ) : (
                    <>
                      <li><Link className="dropdown-item py-2" to="/login" onClick={() => setIsAccountOpen(false)}><i className="bi bi-box-arrow-in-right me-2"></i>Đăng nhập</Link></li>
                      <li><Link className="dropdown-item py-2" to="/signup" onClick={() => setIsAccountOpen(false)}><i className="bi bi-person-plus me-2"></i>Đăng ký thành viên</Link></li>
                    </>
                  )}
                </ul>
              </div>
              
              <Link to="/cart" className="text-dark text-decoration-none d-flex align-items-center position-relative">
                <div className="position-relative">
                  <i className="bi bi-cart3 fs-3 text-secondary"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white">
                    {cartCount}
                  </span>
                </div>
                <span className="ms-3 fw-bold">Giỏ hàng</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
