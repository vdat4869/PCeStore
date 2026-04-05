import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils';

// ============================================================
// DỮ LIỆU MẪU — Sẽ lấy từ API khi Integration
// ============================================================
const MOCK_USER = {
  fullName: 'Đặng Ngọc Anh Đức',
  email: 'duc.dna@email.com',
  phone: '0901 234 567',
  avatar: null,
  createdAt: '2025-01-15',
};

const MOCK_ADDRESSES = [
  { id: 1, street: '28-30 Đường ABC', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true },
  { id: 2, street: '123 Đường XYZ', district: 'Quận Bình Thạnh', city: 'TP. Hồ Chí Minh', isDefault: false },
];

const MOCK_ORDERS = [
  { id: 'PCE001234', date: '2025-03-20', status: 'delivered', paymentMethod: 'COD', total: 12560000, items: [
    { name: 'CPU Intel Core i5-12400F', quantity: 1, price: 3290000, imageUrl: '/src/admin/assets/images/product-1.png' },
    { name: 'VGA NVIDIA GeForce RTX 3060 12GB', quantity: 1, price: 7490000, imageUrl: '/src/admin/assets/images/product-2.png' },
    { name: 'RAM Corsair Vengeance 16GB DDR4', quantity: 2, price: 890000, imageUrl: '/src/admin/assets/images/product-3.png' },
  ]},
  { id: 'PCE001198', date: '2025-03-10', status: 'shipping', paymentMethod: 'VNPAY', total: 4190000, items: [
    { name: 'Mainboard ASUS ROG STRIX B550-F', quantity: 1, price: 4190000, imageUrl: '/src/admin/assets/images/product-6.png' },
  ]},
  { id: 'PCE001102', date: '2025-02-28', status: 'cancelled', paymentMethod: 'COD', total: 590000, items: [
    { name: 'Tản nhiệt ID-Cooling SE-226-XT', quantity: 1, price: 590000, imageUrl: '/src/admin/assets/images/product-2.png' },
  ]},
  { id: 'PCE001050', date: '2025-02-15', status: 'delivered', paymentMethod: 'MOMO', total: 2690000, items: [
    { name: 'SSD Samsung 980 PRO 1TB NVMe', quantity: 1, price: 2690000, imageUrl: '/src/admin/assets/images/product-4.png' },
  ]},
];

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', color: 'warning', icon: 'bi-clock' },
  confirmed: { label: 'Đã xác nhận', color: 'info', icon: 'bi-check-circle' },
  shipping: { label: 'Đang giao', color: 'primary', icon: 'bi-truck' },
  delivered: { label: 'Đã giao', color: 'success', icon: 'bi-check-circle-fill' },
  cancelled: { label: 'Đã huỷ', color: 'danger', icon: 'bi-x-circle' },
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState(MOCK_USER);
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ fullName: user.fullName, phone: user.phone });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ street: '', district: '', city: '', isDefault: false });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [infoMsg, setInfoMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  // ============================================================
  // TABS
  // ============================================================
  const TABS = [
    { key: 'info', label: 'Thông tin cá nhân', icon: 'bi-person' },
    { key: 'password', label: 'Đổi mật khẩu', icon: 'bi-lock' },
    { key: 'addresses', label: 'Sổ địa chỉ', icon: 'bi-geo-alt' },
    { key: 'orders', label: 'Lịch sử đơn hàng', icon: 'bi-bag' },
  ];

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleUpdateInfo = (e) => {
    e.preventDefault();
    setUser({ ...user, fullName: infoForm.fullName, phone: infoForm.phone });
    setEditingInfo(false);
    setInfoMsg('Cập nhật thông tin thành công!');
    setTimeout(() => setInfoMsg(''), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPwError('');
    setPwMsg('');
    if (!passwordForm.currentPassword) return setPwError('Vui lòng nhập mật khẩu hiện tại');
    if (passwordForm.newPassword.length < 9) return setPwError('Mật khẩu mới phải có ít nhất 9 ký tự');
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(passwordForm.newPassword)) {
      return setPwError('Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setPwError('Mật khẩu xác nhận không khớp');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPwMsg('Đổi mật khẩu thành công!');
    setTimeout(() => setPwMsg(''), 3000);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    const newAddr = { ...addressForm, id: Date.now() };
    if (newAddr.isDefault) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setAddresses(prev => [...prev, newAddr]);
    }
    setAddressForm({ street: '', district: '', city: '', isDefault: false });
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Xoá địa chỉ này?')) {
      setAddresses(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div className="container pb-5">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item active">Tài khoản</li>
        </ol>
      </nav>

      <div className="row">
        {/* ============================================================ */}
        {/* SIDEBAR */}
        {/* ============================================================ */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {/* Avatar & Tên */}
              <div className="text-center mb-3">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '72px', height: '72px' }}>
                  <i className="bi bi-person fs-2"></i>
                </div>
                <h6 className="fw-bold mb-0">{user.fullName}</h6>
                <small className="text-muted">{user.email}</small>
              </div>

              <hr />

              {/* Menu */}
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

              <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
                <i className="bi bi-box-arrow-right me-1"></i>Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* NỘI DUNG TAB */}
        {/* ============================================================ */}
        <div className="col-lg-9">
          {/* ===== TAB: Thông tin cá nhân ===== */}
          {activeTab === 'info' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0"><i className="bi bi-person text-danger me-2"></i>Thông tin cá nhân</h5>
                  {!editingInfo && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setEditingInfo(true)}>
                      <i className="bi bi-pencil me-1"></i>Chỉnh sửa
                    </button>
                  )}
                </div>

                {infoMsg && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle-fill me-2"></i>{infoMsg}</div>}

                {editingInfo ? (
                  <form onSubmit={handleUpdateInfo}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Họ và tên</label>
                        <input type="text" className="form-control" value={infoForm.fullName} onChange={e => setInfoForm({ ...infoForm, fullName: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Số điện thoại</label>
                        <input type="tel" className="form-control" value={infoForm.phone} onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-medium">Email</label>
                        <input type="email" className="form-control bg-light" value={user.email} disabled />
                        <small className="form-text text-muted">Email không thể thay đổi</small>
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <button type="submit" className="btn btn-danger"><i className="bi bi-check-lg me-1"></i>Lưu</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingInfo(false)}>Huỷ</button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Họ và tên</label>
                      <p className="fw-medium mb-0">{user.fullName}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Số điện thoại</label>
                      <p className="fw-medium mb-0">{user.phone}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Email</label>
                      <p className="fw-medium mb-0">{user.email}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Ngày tham gia</label>
                      <p className="fw-medium mb-0">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== TAB: Đổi mật khẩu ===== */}
          {activeTab === 'password' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4"><i className="bi bi-lock text-danger me-2"></i>Đổi mật khẩu</h5>

                {pwMsg && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle-fill me-2"></i>{pwMsg}</div>}
                {pwError && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-triangle-fill me-2"></i>{pwError}</div>}

                <form onSubmit={handleChangePassword} style={{ maxWidth: '400px' }}>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Mật khẩu hiện tại</label>
                    <input type="password" className="form-control" value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Mật khẩu mới</label>
                    <input type="password" className="form-control" value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
                    <small className="form-text text-muted">Tối thiểu 9 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt</small>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-medium">Xác nhận mật khẩu mới</label>
                    <input type="password" className="form-control" value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                  </div>
                  <button type="submit" className="btn btn-danger"><i className="bi bi-check-lg me-1"></i>Đổi mật khẩu</button>
                </form>
              </div>
            </div>
          )}

          {/* ===== TAB: Sổ địa chỉ ===== */}
          {activeTab === 'addresses' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0"><i className="bi bi-geo-alt text-danger me-2"></i>Sổ địa chỉ</h5>
                  <button className="btn btn-sm btn-danger" onClick={() => setShowAddAddress(!showAddAddress)}>
                    <i className={`bi ${showAddAddress ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                    {showAddAddress ? 'Đóng' : 'Thêm địa chỉ'}
                  </button>
                </div>

                {/* Form thêm địa chỉ */}
                {showAddAddress && (
                  <form onSubmit={handleAddAddress} className="bg-light rounded-3 p-3 mb-4">
                    <div className="row g-2">
                      <div className="col-12">
                        <input type="text" className="form-control form-control-sm" placeholder="Số nhà, tên đường *" value={addressForm.street}
                          onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <input type="text" className="form-control form-control-sm" placeholder="Quận/Huyện *" value={addressForm.district}
                          onChange={e => setAddressForm({ ...addressForm, district: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <input type="text" className="form-control form-control-sm" placeholder="Tỉnh/Thành phố *" value={addressForm.city}
                          onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required />
                      </div>
                      <div className="col-12 d-flex align-items-center justify-content-between">
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="isDefault" checked={addressForm.isDefault}
                            onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                          <label className="form-check-label small" htmlFor="isDefault">Đặt làm mặc định</label>
                        </div>
                        <button type="submit" className="btn btn-sm btn-danger"><i className="bi bi-check-lg me-1"></i>Lưu</button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Danh sách địa chỉ */}
                {addresses.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-geo-alt fs-1 d-block mb-2"></i>
                    <p>Chưa có địa chỉ nào</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`border rounded-3 p-3 ${addr.isDefault ? 'border-danger' : ''}`}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="fw-medium mb-1">
                              {addr.street}, {addr.district}, {addr.city}
                              {addr.isDefault && <span className="badge bg-danger ms-2">Mặc định</span>}
                            </p>
                          </div>
                          <div className="d-flex gap-2">
                            {!addr.isDefault && (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleSetDefault(addr.id)}>Đặt mặc định</button>
                            )}
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDeleteAddress(addr.id)}>
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== TAB: Lịch sử đơn hàng ===== */}
          {activeTab === 'orders' && (
            <div>
              <h5 className="fw-bold mb-3"><i className="bi bi-bag text-danger me-2"></i>Lịch sử đơn hàng</h5>

              {MOCK_ORDERS.length === 0 ? (
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <i className="bi bi-bag-x fs-1 text-muted d-block mb-2"></i>
                    <h6 className="text-muted">Chưa có đơn hàng nào</h6>
                    <Link to="/products" className="btn btn-danger btn-sm mt-2"><i className="bi bi-bag me-1"></i>Mua sắm ngay</Link>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {MOCK_ORDERS.map(order => {
                    const statusInfo = STATUS_MAP[order.status];
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div className="card border-0 shadow-sm" key={order.id}>
                        <div className="card-body p-4">
                          {/* Header đơn hàng */}
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <span className="fw-bold">#{order.id}</span>
                              <span className="text-muted small ms-3">
                                <i className="bi bi-calendar3 me-1"></i>{new Date(order.date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <span className={`badge bg-${statusInfo.color}`}>
                              <i className={`bi ${statusInfo.icon} me-1`}></i>{statusInfo.label}
                            </span>
                          </div>

                          {/* Sản phẩm đầu tiên (luôn hiện) */}
                          <div className="d-flex align-items-center gap-3 mb-2">
                            <div className="bg-light rounded-2 p-1 flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                              <img src={order.items[0].imageUrl} alt="" className="img-fluid w-100 h-100" style={{ objectFit: 'contain' }} />
                            </div>
                            <div className="flex-grow-1">
                              <p className="small fw-medium mb-0">{order.items[0].name}</p>
                              <small className="text-muted">x{order.items[0].quantity}</small>
                            </div>
                            <span className="text-danger fw-bold small">{formatCurrency(order.items[0].price * order.items[0].quantity)}</span>
                          </div>

                          {/* Sản phẩm mở rộng */}
                          {isExpanded && order.items.slice(1).map((item, idx) => (
                            <div className="d-flex align-items-center gap-3 mb-2" key={idx}>
                              <div className="bg-light rounded-2 p-1 flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                                <img src={item.imageUrl} alt="" className="img-fluid w-100 h-100" style={{ objectFit: 'contain' }} />
                              </div>
                              <div className="flex-grow-1">
                                <p className="small fw-medium mb-0">{item.name}</p>
                                <small className="text-muted">x{item.quantity}</small>
                              </div>
                              <span className="text-danger fw-bold small">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}

                          {/* Footer */}
                          <hr className="my-2" />
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              {order.items.length > 1 && (
                                <button className="btn btn-sm btn-link text-muted p-0 text-decoration-none" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                  {isExpanded ? 'Thu gọn' : `Xem thêm ${order.items.length - 1} sản phẩm`}
                                  <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} ms-1`}></i>
                                </button>
                              )}
                            </div>
                            <div className="text-end">
                              <small className="text-muted">Tổng đơn: </small>
                              <span className="fw-bold text-danger">{formatCurrency(order.total)}</span>
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
        </div>
      </div>
    </div>
  );
}
