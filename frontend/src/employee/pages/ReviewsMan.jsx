import React, { useState } from 'react';

export default function ReviewsMan() {
  const [reviews, setReviews] = useState([
    { id: 1, user: 'Hoàng Long', product: 'RTX 4090 Rog Strix', comment: 'Hàng quá đỉnh, giao nhanh!', rating: 5, status: 'PENDING' },
    { id: 2, user: 'Mai Lan', product: 'Bàn phím cơ AKKO', comment: 'Switch hơi ồn so với clip', rating: 3, status: 'PENDING' }
  ]);

  const handleAction = (id, newStatus) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
    alert(`Đã ${newStatus === 'APPROVED' ? 'duyệt' : 'ẩn'} đánh giá này`);
  };

  return (
    <div className="container-fluid">
       <div className="mb-4">
          <h1 className="fs-3">Kiểm duyệt đánh giá</h1>
          <p className="text-secondary">Phê duyệt hoặc ẩn các nhận xét từ khách hàng</p>
       </div>

       <div className="row">
          {reviews.filter(r => r.status === 'PENDING').length === 0 ? (
            <div className="col-12 text-center py-5">
               <i className="ti ti-check fs-1 text-success"></i>
               <p className="mt-2">Đã xử lý hết đánh giá chờ duyệt!</p>
            </div>
          ) : (
            reviews.filter(r => r.status === 'PENDING').map(r => (
              <div className="col-12 col-md-6 col-lg-4 mb-4" key={r.id}>
                 <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                       <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold">{r.user}</span>
                          <span className="text-warning">
                             {[...Array(r.rating)].map((_, i) => <i key={i} className="ti ti-star-filled"></i>)}
                          </span>
                       </div>
                       <h6 className="text-primary small mb-2">{r.product}</h6>
                       <p className="card-text small text-dark italic">"{r.comment}"</p>
                       <div className="d-flex gap-2 mt-3">
                          <button onClick={() => handleAction(r.id, 'APPROVED')} className="btn btn-sm btn-success w-50">Duyệt</button>
                          <button onClick={() => handleAction(r.id, 'HIDDEN')} className="btn btn-sm btn-outline-danger w-50">Ẩn</button>
                       </div>
                    </div>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
}
