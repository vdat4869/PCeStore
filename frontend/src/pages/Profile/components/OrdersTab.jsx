import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/api';
import { formatCurrency } from '../../../utils';
import { useAuth } from '../../../context/AuthContext';

export default function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Assuming userId is required or it can handle from token
      const userId = user?.id || '';
      const response = await apiClient.get(`/v1/orders/user/${userId}`);
      setOrders(response.data || []);
    } catch (err) {
      console.error(err);
      // fallback to history if specific user endpoint is not mapped like that
      try {
        const response2 = await apiClient.get(`/v1/orders/history`);
        setOrders(response2.data || []);
      } catch (err2) {
        console.error(err2);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;
    try {
      await apiClient.post(`/v1/orders/${orderId}/cancel`);
      alert("Đã huỷ đơn hàng thành công!");
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi huỷ đơn hàng.");
    }
  };

  const STATUS_MAP = {
    PENDING: { label: 'Chờ xác nhận', color: 'warning', icon: 'bi-clock' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'info', icon: 'bi-check-circle' },
    SHIPPING: { label: 'Đang giao', color: 'primary', icon: 'bi-truck' },
    DELIVERED: { label: 'Đã giao', color: 'success', icon: 'bi-check-circle-fill' },
    CANCELLED: { label: 'Đã huỷ', color: 'danger', icon: 'bi-x-circle' },
  };

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-box-seam text-danger me-2"></i>Lịch sử đơn hàng</h5>
      
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-danger"></div><p className="mt-2 text-muted">Đang tải lịch sử...</p></div>
      ) : orders.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <i className="bi bi-bag-x fs-1 text-muted d-block mb-3"></i>
          <h6 className="text-muted">Chưa có đơn hàng nào</h6>
          <Link to="/products" className="btn btn-outline-danger btn-sm mt-3">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map(order => {
            const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'secondary', icon: 'bi-info-circle' };
            const isExpanded = expandedOrder === order.id;

            return (
              <div className="card border-0 shadow-sm" key={order.id}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <span className="fw-bold">Mã ĐH: #{order.id}</span>
                      <span className="text-muted small ms-3">
                        <i className="bi bi-calendar3 me-1"></i>{new Date(order.orderDate || order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <span className={`badge bg-${statusInfo.color}`}>
                      <i className={`bi ${statusInfo.icon} me-1`}></i>{statusInfo.label}
                    </span>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <>
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="bg-light rounded-2 p-1 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                          <i className="bi bi-cpu text-secondary fs-4"></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="small fw-medium mb-0">{order.items[0].productName}</p>
                          <small className="text-muted">Số lượng: {order.items[0].quantity}</small>
                        </div>
                        <span className="text-danger fw-bold small">{formatCurrency(order.items[0].price * order.items[0].quantity)}</span>
                      </div>
                      
                      {isExpanded && order.items.slice(1).map((item, idx) => (
                        <div className="d-flex align-items-center gap-3 mb-2 border-top pt-2" key={idx}>
                          <div className="bg-light rounded-2 p-1 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-cpu text-secondary fs-4"></i>
                          </div>
                          <div className="flex-grow-1">
                            <p className="small fw-medium mb-0">{item.productName}</p>
                            <small className="text-muted">Số lượng: {item.quantity}</small>
                          </div>
                          <span className="text-danger fw-bold small">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <hr className="my-3" />
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                      {order.items && order.items.length > 1 && (
                        <button className="btn btn-sm btn-light text-muted" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                          {isExpanded ? 'Thu gọn' : `Xem thêm ${order.items.length - 1} sản phẩm`}
                        </button>
                      )}
                      {order.status === 'PENDING' && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelOrder(order.id)}>Huỷ đơn</button>
                      )}
                    </div>
                    <div className="text-end">
                      <small className="text-muted">Tổng cộng: </small>
                      <span className="fw-bold text-danger fs-5">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
