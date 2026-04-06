import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([
    { id: 'ORD001', customer: 'Lê Minh Tâm', date: '2026-04-06', amount: '25,000,000₫', status: 'PENDING', payment: 'PAID' },
    { id: 'ORD002', customer: 'Nguyễn Bích Vy', date: '2026-04-06', amount: '12,500,000₫', status: 'CONFIRMED', payment: 'UNPAID' }
  ]);

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    alert(`Đã cập nhật đơn ${id} sang trạng thái ${newStatus}`);
  };

  const getBadgeClass = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-danger text-white';
      case 'CONFIRMED': return 'bg-info text-dark';
      case 'SHIPPING': return 'bg-warning text-dark';
      case 'DELIVERED': return 'bg-success text-white';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="">
              <h1 className="fs-3 mb-1">Vận hành đơn hàng</h1>
              <p className="mb-0 text-muted">Xử lý quy trình: Xác nhận → Đóng gói → Giao hàng</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0 table-responsive">
            <table className="table mb-0 text-nowrap table-hover align-middle">
              <thead className="table-light border-light">
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th>Thao tác vận hành</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">Trống</td></tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id}>
                      <td className="fw-bold text-primary">{o.id}</td>
                      <td>{o.customer}</td>
                      <td>{o.date}</td>
                      <td><span className={`badge ${getBadgeClass(o.status)}`}>{o.status}</span></td>
                      <td>
                        <div className="d-flex gap-2">
                           {o.status === 'PENDING' && (
                             <button onClick={() => updateStatus(o.id, 'CONFIRMED')} className="btn btn-sm btn-outline-success">Xác nhận đơn</button>
                           )}
                           {o.status === 'CONFIRMED' && (
                             <button onClick={() => updateStatus(o.id, 'SHIPPING')} className="btn btn-sm btn-outline-warning">Chuyển Giao hàng</button>
                           )}
                           {o.status === 'SHIPPING' && (
                             <button onClick={() => updateStatus(o.id, 'DELIVERED')} className="btn btn-sm btn-outline-info">Báo đã giao</button>
                           )}
                           <button className="btn btn-sm btn-light">Chi tiết</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
