import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user: authUser, logout: authLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // Default to orders as per my original logic
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // MOCK other data for now
  const [user, setUser] = useState({
    fullName: authUser?.name || 'User',
    email: authUser?.email || 'user@email.com',
    phone: '',
    avatar: null,
  });
  
  const [addresses, setAddresses] = useState([
    { id: 1, street: '28-30 Đường ABC', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true }
  ]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/v1/orders/history`);
      setOrders(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load order history.");
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
      console.error(err);
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

  const TABS = [
    { key: 'info', label: 'Thông tin cá nhân', icon: 'bi-person' },
    { key: 'password', label: 'Đổi mật khẩu', icon: 'bi-lock' },
    { key: 'addresses', label: 'Sổ địa chỉ', icon: 'bi-geo-alt' },
    { key: 'orders', label: 'Lịch sử đơn hàng', icon: 'bi-bag' },
  ];

  return (
    <div className="container pb-5">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item active">Tài khoản</li>
        </ol>
      </nav>

      <div className="row">
        {/* SIDEBAR */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-3">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '72px', height: '72px' }}>
                  <i className="bi bi-person fs-2"></i>
                </div>
                <h6 className="fw-bold mb-0">{user.fullName}</h6>
                <small className="text-muted">{user.email}</small>
              </div>
              <hr />
              <div className="d-flex flex-column gap-1">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    className={`btn btn-sm text-start d-flex align-items-center gap-2 ${activeTab === tab.key ? 'btn-danger' : 'btn-light text-dark'}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <i className={`bi ${tab.icon}`}></i>{tab.label}
                  </button>
                ))}
              </div>
              <hr />
              <button className="btn btn-outline-secondary btn-sm w-100" onClick={authLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* NỘI DUNG TAB */}
        <div className="col-lg-9">
          {activeTab === 'orders' && (
            <div>
              <h5 className="fw-bold mb-3"><i className="bi bi-bag text-danger me-2"></i>Lịch sử đơn hàng</h5>
              
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-danger"></div><p className="mt-2">Đang tải đơn hàng...</p></div>
              ) : orders.length === 0 ? (
                <div className="card border-0 shadow-sm text-center py-5">
                  <i className="bi bi-bag-x fs-1 text-muted d-block mb-2"></i>
                  <h6 className="text-muted">Chưa có đơn hàng nào</h6>
                  <Link to="/products" className="btn btn-danger btn-sm mt-2">Mua sắm ngay</Link>
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
                              <span className="fw-bold">#{order.id}</span>
                              <span className="text-muted small ms-3">
                                <i className="bi bi-calendar3 me-1"></i>{new Date(order.orderDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <span className={`badge bg-${statusInfo.color}`}>
                              <i className={`bi ${statusInfo.icon} me-1`}></i>{statusInfo.label}
                            </span>
                          </div>

                          {order.items && order.items.length > 0 && (
                            <>
                              <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-light rounded-2 p-1 flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                                  <i className="bi bi-box me-1 text-muted" style={{ fontSize: '24px' }}></i>
                                </div>
                                <div className="flex-grow-1">
                                  <p className="small fw-medium mb-0">{order.items[0].productName}</p>
                                  <small className="text-muted">x{order.items[0].quantity}</small>
                                </div>
                                <span className="text-danger fw-bold small">{formatCurrency(order.items[0].price * order.items[0].quantity)}</span>
                              </div>
                              
                              {isExpanded && order.items.slice(1).map((item, idx) => (
                                <div className="d-flex align-items-center gap-3 mb-2 border-top pt-2" key={idx}>
                                  <div className="bg-light rounded-2 p-1 flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                                    <i className="bi bi-box me-1 text-muted" style={{ fontSize: '24px' }}></i>
                                  </div>
                                  <div className="flex-grow-1">
                                    <p className="small fw-medium mb-0">{item.productName}</p>
                                    <small className="text-muted">x{item.quantity}</small>
                                  </div>
                                  <span className="text-danger fw-bold small">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </>
                          )}

                          <hr className="my-2" />
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-2">
                              {order.items && order.items.length > 1 && (
                                <button className="btn btn-sm btn-link text-muted p-0 text-decoration-none" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                  {isExpanded ? 'Thu gọn' : `Xem thêm ${order.items.length - 1} sản phẩm`}
                                  <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} ms-1`}></i>
                                </button>
                              )}
                              {order.status === 'PENDING' && (
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelOrder(order.id)}>Huỷ đơn</button>
                              )}
                            </div>
                            <div className="text-end">
                              <small className="text-muted">Tổng đơn: </small>
                              <span className="fw-bold text-danger">{formatCurrency(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4"><i className="bi bi-person text-danger me-2"></i>Thông tin cá nhân</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Họ và tên</label>
                    <p className="fw-medium mb-0">{user.fullName}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Email</label>
                    <p className="fw-medium mb-0">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ... other tabs would follow similar structure if needed ... */}
        </div>
      </div>
    </div>
  );
}
