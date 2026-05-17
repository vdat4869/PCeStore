import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tabProducts, setTabProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();

  // 1. Tải danh mục và Flash Sale khi mount
  useEffect(() => {
    const initHome = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/products?size=5') // Lấy 5 cái đầu làm flash sale theo layout 5 cột
        ]);
        
        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          setActiveTab(catRes.data[0].id);
        }
        setFlashSaleProducts(prodRes.data.content || []);
      } catch (err) {
        console.error("Lỗi khởi tạo Home:", err);
      } finally {
        setLoading(false);
      }
    };
    initHome();
  }, []);

  // 2. Tải sản phẩm theo tab (danh mục)
  useEffect(() => {
    if (!activeTab) return;
    
    apiClient.get(`/products?categoryId=${activeTab}&size=10`)
      .then(res => setTabProducts(res.data.content || []))
      .catch(err => console.error("Lỗi tải sản phẩm theo danh mục:", err));
  }, [activeTab]);

  const handleAddToCart = (p) => {
    addToCart({
      productId: p.id,
      productName: p.name,
      price: p.price,
      image: p.imageUrl,
      quantity: 1,
    });
    setToast(`Đã thêm "${p.name}" vào giỏ hàng!`);
    setTimeout(() => setToast(null), 2500);
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#323232', color: '#fff', padding: '0.75rem 1.5rem',
          borderRadius: '8px', zIndex: 9999, fontSize: '0.9rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
        }}>
          <i className="bi bi-cart-check me-2 text-success"></i>{toast}
        </div>
      )}

      <div className="container pb-5">
        {/* Banner Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="bg-primary text-white rounded p-5 text-center shadow-sm" style={{ background: 'linear-gradient(45deg, #007bff, #6610f2)' }}>
              <h1 className="fw-bold display-4 mb-3">PCeStore <span className="text-warning">CÔNG NGHỆ ĐỈNH CAO</span></h1>
              <p className="fs-5 mb-4">Nâng tầm trải nghiệm Gaming và Làm việc của bạn</p>
              <Link to="/products" className="btn btn-warning btn-lg fw-bold rounded-pill px-5 shadow">Mua Ngay</Link>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2 overflow-auto">
          <ul className="nav nav-pills flex-nowrap">
            {categories.slice(0, 10).map(cat => (
              <li className="nav-item" key={cat.id}>
                <button
                  className={`nav-link fw-bold me-2 text-nowrap ${activeTab === cat.id ? 'bg-danger text-white' : 'text-dark hover-danger'}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
          <Link to="/products" className="text-danger text-decoration-none fw-medium small text-nowrap ms-3">
            Xem tất cả <i className="bi bi-chevron-right"></i>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="row g-2">
          {tabProducts.map((p) => (
             <div className="mb-3" key={p.id} style={{ width: '20%', flex: '0 0 20%' }}>
              <Link to={`/products/${p.id}`} className="text-decoration-none text-dark">
                 <div className="card h-100 product-card position-relative overflow-hidden bg-white border shadow-sm transition-all hover-shadow" style={{ borderRadius: 6, transition: 'all 0.3s' }}>
                   <span className="position-absolute badge bg-danger" style={{ top: 10, right: 10, zIndex: 2 }}>HOT</span>
                   <div className="text-center p-3 bg-white position-relative">
                    <img src={p.imageUrl || '/default-product.png'} className="img-fluid" alt={p.name} style={{ height: '160px', objectFit: 'contain' }} />
                  </div>
                   <div className="card-body p-3 d-flex flex-column">
                      <h6 className="fw-medium mb-2 text-truncate-2" style={{ height: '40px', fontSize: '14px', lineHeight: '1.4' }}>{p.name}</h6>
                      <div className="text-danger fw-bold fs-6 mb-2">{formatCurrency(p.price)}</div>
                      {/* Specs Badges */}
                      <div className="d-flex flex-wrap gap-1 mt-auto">
                         <span className="badge bg-light text-secondary border fw-normal"><i className="bi bi-cpu me-1"></i>{p.brand}</span>
                      </div>
                   </div>
                   <div className="card-footer bg-white border-top-0 p-3 pt-0">
                      <button className="btn btn-dark fw-bold btn-sm w-100" onClick={(e) => { e.preventDefault(); handleAddToCart(p); }}>Liên hệ</button>
                   </div>
                </div>
              </Link>
            </div>
          ))}
          {tabProducts.length === 0 && <div className="text-center p-4 text-muted w-100">Chưa có sản phẩm trong danh mục này.</div>}
        </div>

        {/* Flash Sale / Latest */}
        <h4 className="fw-bold text-uppercase mb-3 mt-5">
          <i className="bi bi-lightning-charge-fill text-warning me-2"></i>Sản phẩm <span className="text-danger">Mới Nhất</span>
        </h4>
        <div className="row g-2">
          {flashSaleProducts.map((p) => (
             <div className="mb-3" key={p.id} style={{ width: '20%', flex: '0 0 20%' }}>
              <Link to={`/products/${p.id}`} className="text-decoration-none text-dark">
                 <div className="card h-100 product-card position-relative overflow-hidden bg-white border shadow-sm transition-all hover-shadow" style={{ borderRadius: 6, transition: 'all 0.3s' }}>
                   <span className="position-absolute badge bg-danger" style={{ top: 10, right: 10, zIndex: 2 }}>MỚI</span>
                   <div className="text-center p-3 bg-white position-relative">
                    <img src={p.imageUrl || '/default-product.png'} className="img-fluid" alt={p.name} style={{ height: '160px', objectFit: 'contain' }} />
                  </div>
                   <div className="card-body p-3 d-flex flex-column">
                      <h6 className="fw-medium mb-2 text-truncate-2" style={{ height: '40px', fontSize: '14px', lineHeight: '1.4' }}>{p.name}</h6>
                      <div className="text-danger fw-bold fs-6 mb-2">{formatCurrency(p.price)}</div>
                      {/* Specs Badges */}
                      <div className="d-flex flex-wrap gap-1 mt-auto">
                         <span className="badge bg-light text-secondary border fw-normal"><i className="bi bi-cpu me-1"></i>{p.brand}</span>
                      </div>
                   </div>
                   <div className="card-footer bg-white border-top-0 p-3 pt-0">
                      <button className="btn btn-dark fw-bold btn-sm w-100" onClick={(e) => { e.preventDefault(); handleAddToCart(p); }}>Liên hệ</button>
                   </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
