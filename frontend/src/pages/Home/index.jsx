import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const flashSaleProducts = [
    { id: 1, name: "Bàn phím cơ gaming Dareu EK75", img: "/src/admin/assets/images/product-4.png", price: "479,000", oldPrice: "609,000", discount: "21%" },
    { id: 2, name: "Chuột gaming Attack Shark R1", img: "/src/admin/assets/images/product-6.png", price: "399,000", oldPrice: "590,000", discount: "32%" },
    { id: 3, name: "Card WiFi TP-Link Archer TX55E", img: "/src/admin/assets/images/product-8.png", price: "509,000", oldPrice: "559,000", discount: "9%" },
    { id: 4, name: "Màn hình Gaming FPS Philips Evnia", img: "/src/admin/assets/images/product-10.png", price: "3,090,000", oldPrice: "3,290,000", discount: "6%" },
  ];

  return (
    <div className="container pb-5">
      {/* Banner Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="bg-primary text-white rounded p-5 text-center shadow-sm" style={{ background: 'linear-gradient(45deg, #007bff, #6610f2)'}}>
            <h1 className="fw-bold display-4 mb-3">GHẾ ÊM LƯNG <span className="text-warning">QUÀ ƯNG Ý</span></h1>
            <p className="fs-5 mb-4">Mua ghế văn phòng - Tặng củ sạc nhanh 30W trị giá 199K</p>
            <button className="btn btn-warning btn-lg fw-bold rounded-pill px-5 shadow">Mua Ngay</button>
          </div>
        </div>
      </div>

      {/* Main Content Categories */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2 overflow-auto">
        <ul className="nav nav-pills flex-nowrap">
          <li className="nav-item">
            <a className="nav-link bg-danger text-white fw-bold me-2 text-nowrap" href="#!">PC Gaming</a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-dark fw-bold me-2 hover-danger text-nowrap" href="#!">PC Văn Phòng</a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-dark fw-bold me-2 hover-danger text-nowrap" href="#!">PC Đồ Hoạ</a>
          </li>
        </ul>
        <a href="#!" className="text-danger text-decoration-none fw-medium small text-nowrap ms-3">Xem tất cả <i className="bi bi-chevron-right"></i></a>
      </div>

      {/* Flash Sale Section */}
      <h4 className="fw-bold text-uppercase mb-3 mt-5"><i className="bi bi-lightning-charge-fill text-warning me-2"></i>Flash Sale <span className="text-danger">Giá Sốc</span></h4>
      <div className="row">
        {flashSaleProducts.map((p) => (
          <div className="col-12 col-sm-6 col-md-3 mb-4" key={p.id}>
            <div className="card h-100 product-card position-relative overflow-hidden bg-white">
              <div className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 small fw-bold" style={{ zIndex: 1, borderBottomRightRadius: '10px' }}>
                Giảm {p.discount}
              </div>
              <img src={p.img} className="card-img-top p-3" alt={p.name} style={{ height: '200px', objectFit: 'contain' }} />
              <div className="card-body d-flex flex-column border-top">
                <h6 className="card-title fw-bold" style={{ minHeight: '40px' }}>{p.name}</h6>
                <div className="mt-auto">
                  <div className="text-danger fw-bold fs-5">{p.price}đ</div>
                  <div className="text-muted text-decoration-line-through small">{p.oldPrice}đ</div>
                </div>
              </div>
              <div className="card-footer bg-white border-0 text-center pb-3">
                 <Link to={`/products/${p.id}`} className="btn btn-outline-danger w-100 fw-bold">Thêm vào giỏ</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
