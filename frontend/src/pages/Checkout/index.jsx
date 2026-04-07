import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils';
import { validateDiscountCode } from '../../utils/discounts';
import apiClient from '../../services/api';

// ============================================================
// DỮ LIỆU MẪU — Sẽ nhận từ Cart qua state/context
// ============================================================
const MOCK_CHECKOUT_ITEMS = [
  { productId: 1, name: 'CPU Intel Core i5-12400F', price: 3290000, quantity: 1, imageUrl: '/src/admin/assets/images/product-1.png' },
  { productId: 2, name: 'VGA NVIDIA GeForce RTX 3060 12GB', price: 7490000, quantity: 1, imageUrl: '/src/admin/assets/images/product-2.png' },
  { productId: 3, name: 'RAM Corsair Vengeance 16GB DDR4 3200MHz', price: 890000, quantity: 2, imageUrl: '/src/admin/assets/images/product-3.png' },
];

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)', icon: 'bi-cash-stack', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng (Quét mã QR)', icon: 'bi-qr-code-scan', desc: 'Thanh toán nhanh chỉ 2s bằng app Ngân hàng, MoMo, ZaloPay, ShopeePay, Viettel Money, ...' },
];

export default function Checkout() {
  const { cartItems, selectedItems } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
 
  // Lấy các sản phẩm đã chọn từ Giỏ hàng (fallback: toàn bộ giỏ hàng)
  const items = (selectedItems && selectedItems.length > 0)
    ? cartItems.filter(i => selectedItems.includes(i.productId))
    : cartItems;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const discountAmount = subtotal * discountPercent;
  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal - discountAmount + shippingFee;
  
  const handleApplyDiscount = (e) => {
    e.preventDefault();
    const code = discountCode.trim();
    if (!code) {
      setDiscountPercent(0);
      return;
    }
    const percent = validateDiscountCode(code);
    if (percent) {
      setDiscountPercent(percent);
    } else {
      setDiscountPercent(0);
      alert('Mã giảm giá không hợp lệ!');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Vui lòng nhập họ và tên';
    if (!form.phone.trim()) return 'Vui lòng nhập số điện thoại';
    if (!form.email.trim()) return 'Vui lòng nhập email';
    if (!form.province.trim()) return 'Vui lòng chọn tỉnh/thành phố';
    if (!form.district.trim()) return 'Vui lòng chọn quận/huyện';
    if (!form.ward.trim()) return 'Vui lòng chọn phường/xã';
    if (!form.address.trim()) return 'Vui lòng nhập địa chỉ cụ thể';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (items.length === 0) {
        setError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
        setLoading(false);
        return;
      }

      const payload = {
        shippingAddress: `${form.address}, ${form.ward}, ${form.district}, ${form.province}`,
        paymentMethod,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      };
      console.log('[Checkout] Sending payload:', JSON.stringify(payload, null, 2));

      // 1. Tạo đơn hàng và thanh toán trên Backend
      const orderResponse = await apiClient.post('/v1/orders/create', payload);

      const { orderId, payment } = orderResponse.data;

      // 2. Xử lý theo phương thức thanh toán
      if (paymentMethod === 'BANK_TRANSFER') {
        const sepayResponse = await apiClient.post(`/v1/payments/${payment.id}/sepay-checkout`);
        const fields = sepayResponse.data;
        
        // Redirect tới SePay Checkout bằng POST form
        const checkoutForm = document.createElement('form');
        checkoutForm.method = 'POST';
        checkoutForm.action = 'https://checkout.sepay.vn/checkout';
        
        Object.keys(fields).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = fields[key];
          checkoutForm.appendChild(input);
        });
        
        document.body.appendChild(checkoutForm);
        checkoutForm.submit();
      } else {
        // COD hoặc phương thức khác: Hiện màn hình thành công
        setOrderSuccess(true);
      }
    } catch (err) {
      console.error('Submit Error:', err);
      const backendMsg = err.response?.data?.message || err.response?.data || err.message;
      console.error('Backend error detail:', backendMsg);
      setError(`Đặt hàng thất bại: ${backendMsg || 'Vui lòng thử lại!'}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ĐẶT HÀNG THÀNH CÔNG
  // ============================================================
  if (orderSuccess) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body p-5">
                <div className="mb-3">
                  <span className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-check-circle fs-1"></i>
                  </span>
                </div>
                <h3 className="fw-bold mb-2" style={{ color: '#2b3452' }}>Đặt hàng thành công!</h3>
                <p className="text-muted mb-1">Mã đơn hàng: <strong className="text-danger">#PCE{Date.now().toString().slice(-6)}</strong></p>
                <p className="text-muted small mb-4">
                  Chúng tôi sẽ liên hệ bạn qua số điện thoại <strong>{form.phone}</strong> để xác nhận đơn hàng.
                </p>

                <div className="bg-light rounded-3 p-3 mb-4 text-start">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Tổng tiền:</span>
                    <span className="fw-bold text-danger">{formatCurrency(total)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Thanh toán:</span>
                    <span className="small">{PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Giao đến:</span>
                    <span className="small text-end" style={{ maxWidth: '200px' }}>{form.address}, {form.ward}, {form.district}, {form.province}</span>
                  </div>
                </div>

                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/products" className="btn btn-outline-danger px-4">
                    <i className="bi bi-bag me-1"></i>Tiếp tục mua
                  </Link>
                  <Link to="/" className="btn btn-danger px-4">
                    <i className="bi bi-house me-1"></i>Về trang chủ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/cart" className="text-decoration-none">Giỏ hàng</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Thanh toán</li>
        </ol>
      </nav>

      {/* Steps */}
      <div className="d-flex justify-content-center mb-4">
        <div className="d-flex align-items-center gap-2 small">
          <span className="badge bg-success rounded-pill px-3 py-2"><i className="bi bi-check me-1"></i>Giỏ hàng</span>
          <i className="bi bi-chevron-right text-muted"></i>
          <span className="badge bg-danger rounded-pill px-3 py-2"><i className="bi bi-geo-alt me-1"></i>Thanh toán</span>
          <i className="bi bi-chevron-right text-muted"></i>
          <span className="badge bg-light text-muted rounded-pill px-3 py-2">Hoàn tất</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* ============================================================ */}
          {/* CỘT TRÁI — Thông tin giao hàng + Phương thức thanh toán */}
          {/* ============================================================ */}
          <div className="col-lg-7 mb-4">
            {/* Thông tin giao hàng */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-geo-alt text-danger me-2"></i>Thông tin giao hàng
                </h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Họ và tên <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="fullName" placeholder="Nguyễn Văn A" value={form.fullName} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Số điện thoại <span className="text-danger">*</span></label>
                    <input type="tel" className="form-control" name="phone" placeholder="0901 234 567" value={form.phone} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-medium">Email <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" name="email" placeholder="email@example.com" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Tỉnh/Thành phố <span className="text-danger">*</span></label>
                    <select className="form-select" name="province" value={form.province} onChange={handleChange} required>
                      <option value="">Chọn tỉnh/TP</option>
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Quận/Huyện <span className="text-danger">*</span></label>
                    <select className="form-select" name="district" value={form.district} onChange={handleChange} required>
                      <option value="">Chọn quận/huyện</option>
                      <option value="Quận 1">Quận 1</option>
                      <option value="Quận 3">Quận 3</option>
                      <option value="Quận 7">Quận 7</option>
                      <option value="Quận Bình Thạnh">Quận Bình Thạnh</option>
                      <option value="Quận Tân Bình">Quận Tân Bình</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Phường/Xã <span className="text-danger">*</span></label>
                    <select className="form-select" name="ward" value={form.ward} onChange={handleChange} required>
                      <option value="">Chọn phường/xã</option>
                      <option value="Phường 1">Phường 1</option>
                      <option value="Phường 2">Phường 2</option>
                      <option value="Phường 3">Phường 3</option>
                      <option value="Phường 4">Phường 4</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-medium">Địa chỉ cụ thể <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="address" placeholder="Số nhà, tên đường..." value={form.address} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-medium">Ghi chú</label>
                    <textarea className="form-control" name="note" rows="2" placeholder="Ghi chú cho đơn hàng (tuỳ chọn)" value={form.note} onChange={handleChange}></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-credit-card text-danger me-2"></i>Phương thức thanh toán
                </h5>

                <div className="d-flex flex-column gap-2">
                    {PAYMENT_METHODS.map(method => {
                      const isBankTransfer = method.value === 'BANK_TRANSFER';
                      const isSelected = paymentMethod === method.value;
                      
                      return (
                        <label
                          key={method.value}
                          className={`d-flex align-items-center gap-3 p-3 rounded-3 border cursor-pointer transition-all ${
                            isSelected 
                              ? (isBankTransfer ? 'border-warning bg-warning bg-opacity-10' : 'border-danger bg-danger bg-opacity-10') 
                              : 'border-light'
                          }`}
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={isSelected}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className={`form-check-input ${isBankTransfer ? 'accent-warning' : ''}`}
                            style={isBankTransfer && isSelected ? { accentColor: '#fd7e14' } : {}}
                          />
                          <div>
                            <div className="fw-medium">
                              <i className={`bi ${method.icon} me-2 ${isBankTransfer ? 'text-warning' : 'text-danger'}`}></i>
                              {method.label}
                            </div>
                            <small className="text-muted">{method.desc}</small>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CỘT PHẢI — Tóm tắt đơn hàng */}
          {/* ============================================================ */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-bag text-danger me-2"></i>Đơn hàng của bạn ({totalQuantity} sản phẩm)
                </h5>

                {/* Danh sách SP */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {items.map(item => (
                    <div className="d-flex align-items-center gap-3" key={item.productId}>
                      <div className="bg-light rounded-2 p-1 flex-shrink-0 position-relative" style={{ width: '56px', height: '56px' }}>
                        <img src={item.imageUrl} alt="" className="img-fluid w-100 h-100" style={{ objectFit: 'contain' }} />
                        <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <p className="small fw-medium mb-0 text-truncate">{item.name}</p>
                      </div>
                      <span className="text-danger fw-bold small flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Tính tiền */}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="text-success fw-medium">Miễn phí</span>
                  ) : (
                    <span>{formatCurrency(shippingFee)}</span>
                  )}
                </div>

                {/* MÃ GIẢM GIÁ */}
                <div className="mt-3 mb-2">
                  <div 
                    className="d-flex align-items-center justify-content-between p-2 border rounded-3"
                    style={{ 
                      cursor: 'pointer', 
                      backgroundColor: '#f8f9fa',
                      borderColor: '#dee2e6'
                    }}
                    onClick={() => setShowDiscount(!showDiscount)}
                  >
                    <div className="d-flex align-items-center gap-2 text-primary">
                      <i className="bi bi-ticket-perforated fs-5"></i>
                      <span className="small fw-semibold">Sử dụng mã giảm giá</span>
                    </div>
                    <i className={`bi bi-chevron-${showDiscount ? 'up' : 'down'} text-muted small`}></i>
                  </div>
                  
                  {showDiscount && (
                    <div className="mt-2 d-flex gap-2">
                      <input 
                        type="text" 
                        className="form-control form-control-sm border-primary border-opacity-25" 
                        placeholder="Nhập mã giảm giá"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        autoFocus
                      />
                      <button 
                        className="btn btn-sm btn-primary px-3 fw-medium"
                        onClick={handleApplyDiscount}
                      >
                        Áp dụng
                      </button>
                    </div>
                  )}
                </div>

                {discountPercent > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success small">
                    <span>Giảm giá ({discountPercent * 100}%)</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <hr />

                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold fs-5">Tổng cộng</span>
                  <span className="fw-bold fs-5 text-danger">{formatCurrency(total)}</span>
                </div>

                {/* Nút đặt hàng */}
                <button
                  type="submit"
                  className="btn btn-danger w-100 py-3 fw-bold rounded-3 fs-6"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                  ) : (
                    <><i className="bi bi-lock me-2"></i>ĐẶT HÀNG</>
                  )}
                </button>

                <p className="text-center text-muted small mt-3">
                  <i className="bi bi-shield-lock me-1"></i>Thanh toán an toàn và bảo mật
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
