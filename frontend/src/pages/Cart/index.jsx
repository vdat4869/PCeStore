import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils';
import AuthModal from '../../components/AuthModal';
import './cart.css';

// Step progress bar
function CheckoutSteps({ current = 0 }) {
  const steps = [
    { label: 'Giỏ hàng', icon: 'bi-bag' },
    { label: 'Thông tin đặt hàng', icon: 'bi-person-badge' },
    { label: 'Thanh toán', icon: 'bi-credit-card' },
    { label: 'Hoàn tất', icon: 'bi-patch-check' },
  ];
  return (
    <div className="checkout-steps">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div className={`step-item ${idx === current ? 'step-active' : idx < current ? 'step-done' : ''}`}>
            <div className="step-circle">
              <i className={`bi ${step.icon}`}></i>
            </div>
            <span className="step-label">{step.label}</span>
          </div>
          {idx < steps.length - 1 && <div className={`step-line ${idx < current ? 'step-line-done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: 'Sẽ nhập ở bước tiếp theo',
        paymentMethod: 'BANK_TRANSFER',
      };
      const response = await apiClient.post('/v1/orders/create', payload);
      setMessage({ type: 'success', text: `Đặt hàng thành công! Mã đơn hàng: ${response.data.orderId}` });
      clearCart();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  // ── EMPTY CART ──────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <Link to="/products" className="cart-back-link">
          <i className="bi bi-chevron-left"></i> Mua thêm sản phẩm khác
        </Link>

        <div className="cart-steps-card">
          <CheckoutSteps current={0} />
        </div>

        <div className="cart-empty-card">
          <p className="cart-empty-text">Giỏ hàng của bạn đang trống</p>
          <Link to="/products">
            <button className="btn-continue-shopping">TIẾP TỤC MUA HÀNG</button>
          </Link>
        </div>
      </div>
    );
  }

  // ── CART WITH ITEMS ─────────────────────────────────────────
  return (
    <div className="cart-container">
      <Link to="/products" className="cart-back-link">
        <i className="bi bi-chevron-left"></i> Mua thêm sản phẩm khác
      </Link>

      <div className="cart-steps-card">
        <CheckoutSteps current={0} />
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}

      <div className="cart-main-card">
        {/* ── Item list ── */}
        <div className="cart-items-list">
          {cartItems.map((item, idx) => (
            <div className="cart-item-row" key={idx}>
              {/* Image */}
              <div className="cart-item-img">
                {item.image
                  ? <img src={item.image} alt={item.productName} />
                  : <div className="cart-item-img-placeholder"><i className="bi bi-image text-muted"></i></div>
                }
                <button className="btn-remove-text" onClick={() => removeFromCart(item.productId)}>
                  <i className="bi bi-trash3 me-1"></i>Xoá
                </button>
              </div>

              {/* Info */}
              <div className="cart-item-info">
                <p className="cart-item-name">{item.productName}</p>
                <div className="cart-item-price-row">
                  <span className="cart-item-price">{formatCurrency(item.price)}</span>
                  {item.oldPrice && (
                    <span className="cart-item-old-price">{formatCurrency(item.oldPrice)}</span>
                  )}
                </div>
              </div>

              {/* Qty controls */}
              <div className="cart-item-qty">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >−</button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >+</button>
              </div>
            </div>
          ))}
        </div>

        <hr className="cart-divider" />

        {/* ── Coupon ── */}
        <div className="coupon-section">
          <button className="coupon-toggle" onClick={() => setCouponOpen(o => !o)}>
            <i className="bi bi-ticket-perforated me-2"></i>
            Sử dụng mã giảm giá
            <i className={`bi bi-chevron-${couponOpen ? 'up' : 'down'} ms-2`}></i>
          </button>
          {couponOpen && (
            <div className="coupon-input-row">
              <input
                type="text"
                className="coupon-input"
                placeholder="Nhập mã giảm giá..."
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
              />
              <button className="coupon-apply-btn">Áp dụng</button>
            </div>
          )}
        </div>

        <hr className="cart-divider" />

        {/* ── Total + CTA ── */}
        <div className="cart-total-row">
          <span className="cart-total-label">Tổng tiền:</span>
          <span className="cart-total-amount">{formatCurrency(total)}</span>
        </div>

        <button
          className="btn-place-order"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'ĐẶT HÀNG NGAY'}
        </button>
      </div>

      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={() => handleCheckout()} 
      />
    </div>
  );
}
