import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="shadow-sm">
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
              <div className="input-group">
                <button className="btn btn-outline-secondary dropdown-toggle bg-light text-dark fw-medium" type="button" data-bs-toggle="dropdown">
                  <i className="bi bi-list me-1"></i> Danh mục
                </button>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/products?category=pc-gaming">PC Gaming</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=pc-van-phong">PC Văn Phòng</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/products?category=vga">VGA - Card màn hình</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=cpu">CPU - Vi xử lý</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=ram">RAM - Bộ nhớ trong</Link></li>
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
              <Link to="/login" className="text-dark text-decoration-none d-flex align-items-center">
                <i className="bi bi-person-circle fs-3 me-2 text-secondary"></i>
                <div className="text-start small">
                  <div className="fw-medium">Đăng nhập/Đăng ký</div>
                  <div className="text-muted fw-bold">Tài khoản <i className="bi bi-caret-down-fill"></i></div>
                </div>
              </Link>
              
              <Link to="/cart" className="text-dark text-decoration-none d-flex align-items-center position-relative">
                <div className="position-relative">
                  <i className="bi bi-cart3 fs-3 text-secondary"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white">
                    0
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
