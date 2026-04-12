import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';

/**
 * Hàm hỗ trợ lấy thông tin hiển thị theo trạng thái.
 * Đưa ra ngoài để tránh lỗi cú pháp lồng nhau và tối ưu hiệu năng.
 */
const getStatusConfig = (status) => {
  const configs = {
    'PENDING': { label: 'Chờ xử lý', color: 'secondary', icon: 'bi-clock', next: 'PAID', nextLabel: 'Ghi nhận Thanh toán' },
    'PAID': { label: 'Đã thanh toán', color: 'success', icon: 'bi-check-circle', next: 'CONFIRMED', nextLabel: 'Xác nhận đơn hàng' },
    'CONFIRMED': { label: 'Đã xác nhận', color: 'primary', icon: 'bi-hand-thumbs-up', next: 'SHIPPING', nextLabel: 'Bắt đầu giao hàng' },
    'SHIPPING': { label: 'Đang giao hàng', color: 'warning', icon: 'bi-truck', next: 'DELIVERED', nextLabel: 'Giao hàng thành công' },
    'DELIVERED': { label: 'Hoàn thành', color: 'info', icon: 'bi-flag-fill', next: null },
    'CANCELLED': { label: 'Đã hủy', color: 'danger', icon: 'bi-x-circle', next: null }
  };
  return configs[status] || { label: status, color: 'dark', icon: 'bi-info-circle', next: null };
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/v1/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
    
    let interval;
    if (order?.status === 'PENDING') {
      interval = setInterval(() => {
        fetchOrderDetail();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, order?.status]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await apiClient.put(`/v1/orders/admin/${id}/status?status=${newStatus}`);
      await fetchOrderDetail();
      alert(`Thành công: Trạng thái đơn hàng là ${newStatus}`);
    } catch (err) {
      alert("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleSyncSePay = async () => {
    try {
      setUpdating(true);
      await apiClient.post(`/v1/payments/reconcile/${id}`);
      await fetchOrderDetail();
      alert("Đã hoàn tất kiểm tra đối soát với SePay.");
    } catch (err) {
      alert("Lỗi đồng bộ: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2 text-muted">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="alert alert-danger mx-4 mt-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Không tìm thấy đơn hàng #{id}
      </div>
    );
  }

  const statusInfo = getStatusConfig(order.status);

  return (
    <div className="container-fluid py-4">
      {/* Header & Breadcrumbs */}
      <div className="d-flex align-items-center mb-4 px-2">
        <Link to="/admin/orders" className="btn btn-outline-secondary btn-sm me-3 border-0 shadow-sm">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div>
          <h1 className="h4 mb-0 fw-bold">Đơn hàng #{order.id}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.85rem' }}>
              <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/admin/orders">Đơn hàng</Link></li>
              <li className="breadcrumb-item active">#{order.id}</li>
            </ol>
          </nav>
        </div>
        <div className="ms-auto">
          <span className={`badge bg-${statusInfo.color} p-2 px-3 rounded-pill shadow-sm text-white`}>
            <i className={`bi ${statusInfo.icon} me-1`}></i> {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Flow Control & Product List */}
        <div className="col-lg-8">
          {/* Action Card */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-3">Xử lý quy trình đơn hàng</h5>
              
              <div className="d-flex flex-wrap gap-2">
                {statusInfo.next && (
                  <button 
                    onClick={() => handleUpdateStatus(statusInfo.next)}
                    className={`btn btn-${statusInfo.color} px-4 py-2 fw-bold text-white shadow-sm`}
                    disabled={updating}
                  >
                    {updating ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-arrow-right-circle me-1"></i>}
                    {statusInfo.nextLabel}
                  </button>
                )}
                
                {order.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={handleSyncSePay}
                      className="btn btn-primary px-4 py-2 fw-bold text-white shadow-sm"
                      disabled={updating}
                    >
                      <i className="bi bi-arrow-repeat me-1"></i> Đồng bộ SePay
                    </button>

                    <button 
                      onClick={() => handleUpdateStatus('PAID')}
                      className="btn btn-outline-success px-4 py-2 fw-bold"
                      disabled={updating}
                    >
                      Ghi nhận Thanh toán thủ công
                    </button>
                  </>
                )}
                
                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'PENDING' && (
                  <button 
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    className="btn btn-outline-danger px-4 py-2 fw-bold"
                    disabled={updating}
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
              
              {order.status === 'PENDING' && (
                <div className="alert alert-info mt-3 mb-0 small border-0 bg-opacity-10 py-2">
                  <i className="bi bi-info-circle me-1"></i>
                  Ghi chú: Bản đối soát SePay chạy tự động mỗi 2 phút. Bạn có thể nhấn "Đồng bộ SePay" để kiểm tra ngay.
                </div>
              )}
            </div>
          </div>

          {/* Product Items Table */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-0">
              <div className="p-4 border-bottom">
                <h5 className="card-title fw-bold mb-0">Danh sách sản phẩm</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr className="small text-muted">
                      <th className="px-4 py-3 border-0">Sản phẩm</th>
                      <th className="py-3 border-0 text-center">Số lượng</th>
                      <th className="py-3 border-0 text-end px-4">Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 border-0">
                          <div className="d-flex align-items-center">
                            <div className="rounded border bg-white p-1 me-3 shadow-sm" style={{ width: '55px', height: '55px' }}>
                              <img 
                                src={item.imageUrl || 'https://placehold.co/100x100?text=PC'} 
                                alt={item.productName} 
                                className="w-100 h-100 object-fit-contain"
                              />
                            </div>
                            <div>
                              <div className="fw-bold text-dark mb-0">{item.productName}</div>
                              <small className="text-muted">Mã SP: SP-{item.id || idx}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 border-0 fw-bold">x{item.quantity}</td>
                        <td className="text-end px-4 py-3 border-0 text-primary fw-bold">
                          {item.price?.toLocaleString()}₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-top bg-light bg-opacity-25">
                    <tr>
                      <td colSpan="2" className="text-end py-3 px-4 text-secondary">Tạm tính:</td>
                      <td className="text-end py-3 px-4 fw-bold">{(order.totalAmount - (order.shipping?.shippingCost || 0)).toLocaleString()}₫</td>
                    </tr>
                    {order.shipping?.shippingCost > 0 && (
                      <tr>
                        <td colSpan="2" className="text-end py-2 px-4 text-secondary">Phí vận chuyển:</td>
                        <td className="text-end py-2 px-4 fw-bold">+{order.shipping.shippingCost.toLocaleString()}₫</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="2" className="text-end py-4 px-4 fs-5 fw-bold">Tổng cộng:</td>
                      <td className="text-end py-4 px-4 h4 fw-bold text-danger">{order.totalAmount?.toLocaleString()}₫</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Payment Details */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-4">Khách hàng</h5>
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                  <i className="bi bi-person-badge fs-4"></i>
                </div>
                <div>
                  <div className="fw-bold fs-6">{order.customerName || 'Khách vãng lai'}</div>
                  <div className="text-secondary small">{order.customerEmail}</div>
                </div>
              </div>
              <div className="mb-0">
                <div className="text-muted small mb-1">Địa chỉ giao hàng:</div>
                <div className="fw-medium text-dark line-height-sm">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  {order.shipping?.deliveryAddress || 'Chưa có địa chỉ'}
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-4">Thông tin thanh toán</h5>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary small">Phương thức:</span>
                <span className="fw-bold small">{order.paymentMethod || 'Chuyển khoản'}</span>
              </div>
              <div className="d-flex justify-content-between mb-4">
                <span className="text-secondary small">Trạng thái:</span>
                <span className={`badge ${order.paymentStatus === 'COMPLETED' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${order.paymentStatus === 'COMPLETED' ? 'success' : 'warning'} px-3`}>
                  {order.paymentStatus === 'COMPLETED' ? 'Đã thu tiền' : 'Chưa thu tiền'}
                </span>
              </div>
              <div className="text-center p-3 bg-light rounded" style={{ border: '1px dashed #dee2e6' }}>
                <div className="text-muted small mb-1">Mã đơn hệ thống</div>
                <div className="fw-bold text-primary">DH-00{order.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
