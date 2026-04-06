import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils';

// ============================================================
// DỮ LIỆU MẪU — Sản phẩm theo từng danh mục tab
// ID khớp với mảng MOCK_PRODUCTS trong Product/index.jsx & ProductDetail/index.jsx
// ============================================================
const CATEGORY_PRODUCTS = {
  gaming: [
    { id: 2, name: 'VGA NVIDIA GeForce RTX 3060 12GB', img: '/src/admin/assets/images/product-2.png', price: 7490000, oldPrice: 7990000, discount: '6%' },
    { id: 7, name: 'VGA MSI GeForce RTX 4060 VENTUS 2X', img: '/src/admin/assets/images/product-7.png', price: 8290000, oldPrice: 8990000, discount: '8%' },
    { id: 1, name: 'CPU Intel Core i5-12400F', img: '/src/admin/assets/images/product-1.png', price: 3290000, oldPrice: 3590000, discount: '8%' },
    { id: 5, name: 'CPU AMD Ryzen 5 5600X', img: '/src/admin/assets/images/product-5.png', price: 3590000, oldPrice: 4190000, discount: '14%' },
  ],
  vanphong: [
    { id: 3, name: 'RAM Corsair Vengeance 16GB DDR4', img: '/src/admin/assets/images/product-3.png', price: 890000, oldPrice: 1090000, discount: '18%' },
    { id: 9, name: 'SSD WD Black SN770 500GB', img: '/src/admin/assets/images/product-9.png', price: 1290000, oldPrice: 1490000, discount: '13%' },
    { id: 10, name: 'PSU Corsair RM750e 750W 80+ Gold', img: '/src/admin/assets/images/product-10.png', price: 2390000, oldPrice: 2690000, discount: '11%' },
    { id: 11, name: 'Case Gigabyte C200 Glass', img: '/src/admin/assets/images/product-1.png', price: 1190000, oldPrice: 1390000, discount: '14%' },
  ],
  dohoa: [
    { id: 7, name: 'VGA MSI GeForce RTX 4060 VENTUS 2X', img: '/src/admin/assets/images/product-7.png', price: 8290000, oldPrice: 8990000, discount: '8%' },
    { id: 6, name: 'Mainboard ASUS ROG STRIX B550-F', img: '/src/admin/assets/images/product-6.png', price: 4190000, oldPrice: 4690000, discount: '11%' },
    { id: 8, name: 'RAM Kingston Fury Beast 32GB DDR5', img: '/src/admin/assets/images/product-8.png', price: 2190000, oldPrice: 2590000, discount: '15%' },
    { id: 4, name: 'SSD Samsung 980 PRO 1TB NVMe', img: '/src/admin/assets/images/product-4.png', price: 2690000, oldPrice: 3090000, discount: '13%' },
  ],
};

const FLASH_SALE_PRODUCTS = [
  { id: 3, name: 'RAM Corsair Vengeance 16GB DDR4 3200MHz', img: '/src/admin/assets/images/product-3.png', price: 890000, oldPrice: 1090000, discount: '18%' },
  { id: 12, name: 'Tản nhiệt ID-Cooling SE-226-XT', img: '/src/admin/assets/images/product-2.png', price: 590000, oldPrice: 790000, discount: '25%' },
  { id: 9, name: 'SSD WD Black SN770 500GB NVMe', img: '/src/admin/assets/images/product-9.png', price: 1290000, oldPrice: 1490000, discount: '13%' },
  { id: 11, name: 'Case Gigabyte C200 Glass', img: '/src/admin/assets/images/product-1.png', price: 1190000, oldPrice: 1390000, discount: '14%' },
];

const TABS = [
  { key: 'gaming', label: 'PC Gaming' },
  { key: 'vanphong', label: 'PC Văn Phòng' },
  { key: 'dohoa', label: 'PC Đồ Hoạ' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('gaming');
  const currentProducts = CATEGORY_PRODUCTS[activeTab];

  return (
    <div className="container pb-5">
      {/* Banner Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="bg-primary text-white rounded p-5 text-center shadow-sm" style={{ background: 'linear-gradient(45deg, #007bff, #6610f2)'}}>
            <h1 className="fw-bold display-4 mb-3">GHẾ ÊM LƯNG <span className="text-warning">QUÀ ƯNG Ý</span></h1>
            <p className="fs-5 mb-4">Mua ghế văn phòng - Tặng củ sạc nhanh 30W trị giá 199K</p>
            <Link to="/products" className="btn btn-warning btn-lg fw-bold rounded-pill px-5 shadow">Mua Ngay</Link>
          </div>
        </div>
      </div>

      {/* Category Tabs — Có hành động khi click */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2 overflow-auto">
        <ul className="nav nav-pills flex-nowrap">
          {TABS.map(tab => (
            <li className="nav-item" key={tab.key}>
              <button
                className={`nav-link fw-bold me-2 text-nowrap ${activeTab === tab.key ? 'bg-danger text-white' : 'text-dark hover-danger'}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <Link to="/products" className="text-danger text-decoration-none fw-medium small text-nowrap ms-3">
          Xem tất cả <i className="bi bi-chevron-right"></i>
        </Link>
      </div>

      {/* Category Products Grid */}
      <div className="row">
        {currentProducts.map((p) => (
          <div className="col-12 col-sm-6 col-md-3 mb-4" key={p.id}>
            <Link to={`/products/${p.id}`} className="text-decoration-none text-dark">
              <div className="card h-100 product-card position-relative overflow-hidden bg-white border-0 shadow-sm">
                <div className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 small fw-bold" style={{ zIndex: 1, borderBottomRightRadius: '10px' }}>
                  Giảm {p.discount}
                </div>
                <div className="text-center bg-light p-3">
                  <img src={p.img} className="img-fluid" alt={p.name} style={{ height: '180px', objectFit: 'contain' }} />
                </div>
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title fw-bold" style={{ minHeight: '40px', fontSize: '14px' }}>{p.name}</h6>
                  <div className="mt-auto">
                    <div className="text-danger fw-bold fs-5">{formatCurrency(p.price)}</div>
                    <div className="text-muted text-decoration-line-through small">{formatCurrency(p.oldPrice)}</div>
                  </div>
                </div>
                <div className="card-footer bg-white border-top-0 text-center pb-3">
                  <button
                    className="btn btn-outline-danger w-100 fw-bold"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      alert(`Đã thêm "${p.name}" vào giỏ hàng!`);
                    }}
                  >
                    <i className="bi bi-cart-plus me-1"></i>Thêm vào giỏ
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Flash Sale Section */}
      <h4 className="fw-bold text-uppercase mb-3 mt-5">
        <i className="bi bi-lightning-charge-fill text-warning me-2"></i>Flash Sale <span className="text-danger">Giá Sốc</span>
      </h4>
      <div className="row">
        {FLASH_SALE_PRODUCTS.map((p) => (
          <div className="col-12 col-sm-6 col-md-3 mb-4" key={p.id}>
            <Link to={`/products/${p.id}`} className="text-decoration-none text-dark">
              <div className="card h-100 product-card position-relative overflow-hidden bg-white border-0 shadow-sm">
                <div className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 small fw-bold" style={{ zIndex: 1, borderBottomRightRadius: '10px' }}>
                  Giảm {p.discount}
                </div>
                <div className="text-center bg-light p-3">
                  <img src={p.img} className="img-fluid" alt={p.name} style={{ height: '180px', objectFit: 'contain' }} />
                </div>
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title fw-bold" style={{ minHeight: '40px', fontSize: '14px' }}>{p.name}</h6>
                  <div className="mt-auto">
                    <div className="text-danger fw-bold fs-5">{formatCurrency(p.price)}</div>
                    <div className="text-muted text-decoration-line-through small">{formatCurrency(p.oldPrice)}</div>
                  </div>
                </div>
                <div className="card-footer bg-white border-top-0 text-center pb-3">
                  <button
                    className="btn btn-outline-danger w-100 fw-bold"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      alert(`Đã thêm "${p.name}" vào giỏ hàng!`);
                    }}
                  >
                    <i className="bi bi-cart-plus me-1"></i>Thêm vào giỏ
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
