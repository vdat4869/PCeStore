import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils';

const Header = ({ minimal = false }) => {
  const { cartCount } = useCart();
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  
  // Trạng thái đóng/mở menu (React-controlled)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(1);

  const megaMenuData = [
    { id: 1, name: "CPU, Mainboard, VGA", icon: "bi-cpu", sub: ["CPU", "Mainboard", "VGA"] },
    { id: 2, name: "RAM, SSD, HDD", icon: "bi-memory", sub: ["RAM", "SSD", "HDD"] },
    { id: 3, name: "Vỏ Case, Tản nhiệt, Nguồn", icon: "bi-box", sub: ["Case", "Tản nhiệt", "Nguồn"] },
    { id: 4, name: "Màn hình máy tính", icon: "bi-display", sub: ["Màn hình Gaming", "Màn hình Đồ họa", "Màn hình 4K"] },
    { id: 5, name: "Laptop & Macbook", icon: "bi-laptop", sub: ["Laptop Gaming", "Macbook", "Laptop Văn phòng"] },
    { id: 6, name: "Bàn phím, Chuột, Tai nghe", icon: "bi-mouse", sub: ["Bàn phím", "Chuột", "Tai nghe"] },
    { id: 7, name: "Build PC theo yêu cầu", icon: "bi-pc-display", sub: ["PC Gaming", "PC Workstation", "PC Văn phòng"] },
  ];
  
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

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
    navigate('/login');
  };

  return (
    <header className="shadow-sm sticky-top bg-white">
      {/* Top Bar */}
      <div className="bg-danger text-white py-1 d-none d-md-block">
        <div className="container d-flex justify-content-center justify-content-md-between align-items-center">
          <ul className="nav small">
            <li className="nav-item"><Link to="/khuyen-mai" className="nav-link text-white py-1 px-2"><i className="bi bi-gift me-1"></i>Khuyến mãi</Link></li>
            <li className="nav-item"><Link to="/tra-gop" className="nav-link text-white py-1 px-2"><i className="bi bi-credit-card me-1"></i>Trả góp</Link></li>
            <li className="nav-item"><Link to="/order-tracking" className="nav-link text-white py-1 px-2"><i className="bi bi-box-seam me-1"></i>Tra cứu đơn hàng</Link></li>
            <li className="nav-item"><Link to="/build-pc" className="nav-link text-white py-1 px-2 fw-bold text-warning"><i className="bi bi-pc-display me-1"></i>Xây dựng cấu hình</Link></li>
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
                <img src="/logo-estore-removebg-preview.png" alt="PCeStore Logo" style={{ height: '45px', objectFit: 'contain' }} />
              </Link>
            </div>
            
            {/* Search Bar */}
            <div className="col-12 col-md-5 mb-3 mb-md-0">
              <div className="input-group" ref={categoryRef}>
                {!minimal && (
                  <button 
                    className={`btn btn-outline-secondary dropdown-toggle bg-light text-dark fw-medium ${isCategoryOpen ? 'show' : ''}`} 
                    type="button" 
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    <i className="bi bi-list me-1"></i> Danh mục
                  </button>
                )}
                {isCategoryOpen && (
                  <div className="dropdown-menu shadow border-0 show p-0 d-none d-md-flex" style={{ zIndex: 11000, width: '800px', position: 'absolute', top: '100%', left: 0, marginTop: '2px', minHeight: '350px' }}>
                     {/* Cột trái: Main categories */}
                     <div className="bg-white border-end py-2" style={{ width: '35%', overflowY: 'auto' }}>
                        {megaMenuData.map(item => (
                           <div 
                              key={item.id}
                              className={`py-2 px-3 fw-medium d-flex align-items-center justify-content-between ${activeMenuId === item.id ? 'bg-light text-danger' : 'text-dark'}`}
                              style={{ cursor: 'pointer', fontSize: '13px' }}
                              onMouseEnter={() => setActiveMenuId(item.id)}
                              onClick={() => { setIsCategoryOpen(false); navigate(`/products?q=${encodeURIComponent(item.name)}`); }}
                           >
                              <span><i className={`bi ${item.icon} me-2 ${activeMenuId === item.id ? 'text-danger' : 'text-secondary'}`}></i>{item.name}</span>
                              <i className="bi bi-chevron-right small text-muted" style={{ fontSize: '10px' }}></i>
                           </div>
                        ))}
                     </div>
                     {/* Cột phải: Subcategories */}
                     <div className="bg-light p-4" style={{ width: '65%', overflowY: 'auto' }}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                           <i className="bi bi-fire text-danger fs-5"></i>
                           <h6 className="mb-0 fw-bold">Gợi ý cho bạn</h6>
                        </div>
                        <div className="row g-3">
                           {megaMenuData.find(x => x.id === activeMenuId)?.sub.map((sub, idx) => (
                              <div className="col-6" key={idx}>
                                 <Link 
                                    to={`/products?q=${encodeURIComponent(sub)}`} 
                                    className="text-decoration-none text-dark small fw-medium d-block py-1 px-2 rounded hover-bg-white transition-all"
                                    onClick={() => setIsCategoryOpen(false)}
                                    style={{
                                       transition: 'all 0.2s',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.classList.add('text-danger', 'bg-white', 'shadow-sm') }}
                                    onMouseOut={(e) => { e.currentTarget.classList.remove('text-danger', 'bg-white', 'shadow-sm') }}
                                 >
                                    {sub}
                                 </Link>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
                {/* Mobile Dropdown (Fallbacks) */}
                {isCategoryOpen && (
                   <ul className="dropdown-menu shadow border-0 show d-block d-md-none" style={{ zIndex: 11000, width: '100%' }}>
                     {megaMenuData.map(item => (
                        <li key={item.id}><Link className="dropdown-item" to={`/products?q=${encodeURIComponent(item.name)}`} onClick={() => setIsCategoryOpen(false)}>{item.name}</Link></li>
                     ))}
                   </ul>
                )}
                {!minimal ? (
                  <>
                    <input type="text" className="form-control" placeholder="Bạn tìm gì..." />
                    <button className="btn btn-danger px-4" type="button">
                      <i className="bi bi-search"></i>
                    </button>
                  </>
                ) : (
                  <div className="d-flex align-items-center h-100 ps-3 border-start ms-3">
                    <h4 className="mb-0 fw-bold text-dark">
                      {window.location.pathname.includes('login') ? 'Đăng nhập' : 
                       window.location.pathname.includes('register') || window.location.pathname.includes('signup') ? 'Đăng ký' : 
                       window.location.pathname.includes('forgot-password') ? 'Khôi phục mật khẩu' : ''}
                    </h4>
                  </div>
                )}
              </div>
              {!minimal && (
                <div className="small mt-1 text-muted d-none d-md-flex gap-3">
                  <Link to="/products?q=VGA" className="text-decoration-none text-secondary">VGA</Link>
                  <Link to="/products?q=CPU" className="text-decoration-none text-secondary">CPU</Link>
                  <Link to="/products?q=Laptop" className="text-decoration-none text-secondary">Laptop</Link>
                  <Link to="/products?q=Màn hình" className="text-decoration-none text-secondary">Màn hình</Link>
                  <Link to="/products?q=RAM" className="text-decoration-none text-secondary">RAM</Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="col-12 col-md-4 text-center text-md-end d-flex justify-content-center justify-content-md-end align-items-center gap-4">
              {minimal ? (
                <Link to="/" className="text-danger text-decoration-none fw-medium">
                  Bạn cần giúp đỡ?
                </Link>
              ) : (
                <>
                  <div className="dropdown" ref={accountRef}>
                    <button 
                      className={`btn border-0 d-flex align-items-center p-0 dropdown-toggle no-caret ${isAccountOpen ? 'show' : ''}`} 
                      type="button" 
                      onClick={() => setIsAccountOpen(!isAccountOpen)}
                    >
                      {isLoggedIn && user?.role !== 'ADMIN' && user?.avatarUrl ? (
                        <img src={formatImageUrl(user.avatarUrl)} alt="" className="rounded-circle me-2 object-fit-cover shadow-sm" style={{ width: '32px', height: '32px', border: '1px solid #eee' }} />
                      ) : (
                        <i className={`bi bi-person-circle fs-3 me-2 ${isLoggedIn ? 'text-primary' : ''}`} style={{ color: isLoggedIn ? '' : '#888', fontSize: '1.8rem' }}></i>
                      )}
                      <div className="text-start small d-none d-lg-block">
                        <div className="text-muted" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                          {isLoggedIn && user?.role !== 'ADMIN' ? 'Xin chào,' : 'Đăng nhập/Đăng ký'}
                        </div>
                        <div className="text-dark fw-bold" style={{ fontSize: '14px' }}>
                          {isLoggedIn && user?.role !== 'ADMIN' ? (user?.name || 'Tài khoản') : 'Tài khoản'} <i className={`bi bi-caret-down-fill ${(isLoggedIn && user?.role !== 'ADMIN') ? '' : 'text-muted'}`} style={{ fontSize: '10px' }}></i>
                        </div>
                      </div>
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${isAccountOpen ? 'show' : ''}`} style={{ zIndex: 11000 }}>
                      {isLoggedIn && user?.role !== 'ADMIN' ? (
                        <>
                          <li><Link className="dropdown-item py-2" to="/profile" onClick={() => setIsAccountOpen(false)}><i className="bi bi-person me-2"></i>Thông tin cá nhân</Link></li>
                          <li><Link className="dropdown-item py-2" to="/profile" onClick={() => setIsAccountOpen(false)}><i className="bi bi-box-seam me-2"></i>Đơn hàng của tôi</Link></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li><button className="dropdown-item py-2 text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Đăng xuất</button></li>
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
                    <span className="ms-3 fw-bold d-none d-lg-block">Giỏ hàng</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
