import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils';
import apiClient from '../../services/api';
import AuthModal from '../../components/AuthModal';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  
  // Selection state (local to this view)
  const [selectedItems, setSelectedItems] = useState(cartItems.map(item => item.productId));
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [message, setMessage] = useState(null);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleToggleSelect = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.productId));
    }
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const itemsToOrder = cartItems.filter(i => selectedItems.includes(i.productId));
      const payload = {
        items: itemsToOrder.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: 'Sẽ nhập ở bước tiếp theo',
        paymentMethod: 'BANK_TRANSFER',
      };
      const response = await apiClient.post('/v1/orders/create', payload);
      setMessage({ type: 'success', text: `Đặt hàng thành công! Mã đơn hàng: ${response.data.orderId}` });
      
      // Remove ordered items from cart
      itemsToOrder.forEach(i => removeFromCart(i.productId));
      setSelectedItems([]);
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // TÍNH TOÁN
  // ============================================================
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.productId));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = (subtotal >= 500000 || subtotal === 0) ? 0 : 30000;
  const total = subtotal + shippingFee;

  // ============================================================
  // GIỎ HÀNG TRỐNG
  // ============================================================
  if (cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <i className="bi bi-cart-x" style={{ fontSize: '80px', color: '#dee2e6' }}></i>
          <h3 className="mt-3 fw-bold" style={{ color: '#2b3452' }}>Giỏ hàng trống</h3>
          <p className="text-muted mb-4">Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
          <Link to="/products" className="btn btn-danger px-5 py-2 fw-medium rounded-3">
            <i className="bi bi-bag me-2"></i>Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-5">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Giỏ hàng ({cartItems.length})</li>
        </ol>
      </nav>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="row">
        {/* CỘT TRÁI — Danh sách sản phẩm */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="selectAll"
                      checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                      onChange={handleSelectAll}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="selectAll">
                      Chọn tất cả ({cartItems.length})
                    </label>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={clearCart}>
                  <i className="bi bi-trash3 me-1"></i>Xoá tất cả
                </button>
              </div>
            </div>

            <div className="card-body p-0">
              {cartItems.map((item, index) => (
                <div
                  className={`d-flex align-items-center gap-3 p-4 ${index < cartItems.length - 1 ? 'border-bottom' : ''}`}
                  key={item.productId}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedItems.includes(item.productId)}
                      onChange={() => handleToggleSelect(item.productId)}
                    />
                  </div>

                  <Link to={`/products/${item.productId}`}>
                    <div className="bg-light rounded-3 p-2 flex-shrink-0" style={{ width: '90px', height: '90px' }}>
                      <img
                        src={item.image || '/src/admin/assets/images/product-1.png'}
                        alt={item.productName}
                        className="img-fluid w-100 h-100"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  </Link>

                  <div className="flex-grow-1 min-width-0">
                    <Link to={`/products/${item.productId}`} className="text-decoration-none text-dark">
                      <h6 className="fw-bold mb-1" style={{ fontSize: '14px' }}>{item.productName}</h6>
                    </Link>
                    <span className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>PC Component</span>
                    <div className="d-md-none mt-2">
                      <span className="text-danger fw-bold">{formatCurrency(item.price)}</span>
                    </div>
                  </div>

                  <div className="text-end d-none d-md-block flex-shrink-0" style={{ minWidth: '120px' }}>
                    <div className="text-danger fw-bold">{formatCurrency(item.price)}</div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="input-group input-group-sm" style={{ width: '110px' }}>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <input
                        type="text"
                        className="form-control text-center fw-bold"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>

                  <div className="text-end d-none d-md-block flex-shrink-0" style={{ minWidth: '130px' }}>
                    <div className="fw-bold text-danger">{formatCurrency(item.price * item.quantity)}</div>
                  </div>

                  <button
                    className="btn btn-sm btn-outline-secondary border-0 flex-shrink-0"
                    onClick={() => removeFromCart(item.productId)}
                    title="Xoá sản phẩm"
                  >
                    <i className="bi bi-x-lg text-muted"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <Link to="/products" className="text-decoration-none text-danger fw-medium small">
              <i className="bi bi-arrow-left me-1"></i>Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* CỘT PHẢI — Tóm tắt đơn hàng */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-receipt text-danger me-2"></i>Tóm tắt đơn hàng
              </h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính ({totalQuantity} sản phẩm)</span>
                <span className="fw-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Phí vận chuyển</span>
                {shippingFee === 0 ? (
                  <span className="text-success fw-medium">Miễn phí</span>
                ) : (
                  <span className="fw-medium">{formatCurrency(shippingFee)}</span>
                )}
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Tổng tiền</span>
                <span className="fw-bold fs-5 text-danger">{formatCurrency(total)}</span>
              </div>

              <button
                className="btn btn-danger w-100 py-3 fw-bold rounded-3"
                disabled={loading || selectedItems.length === 0}
                onClick={handleCheckout}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="bi bi-bag-check me-2"></i>
                    ĐẶT HÀNG NGAY ({selectedItems.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={() => handleCheckout()} 
      />
    </div>
  );
}
