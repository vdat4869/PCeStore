import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils';

// ============================================================
// DỮ LIỆU MẪU GIỎ HÀNG
// Sau này sẽ dùng Context/Redux để quản lý giỏ hàng global
// ============================================================
const INITIAL_CART = [
  { id: 1, productId: 1, name: 'CPU Intel Core i5-12400F', price: 3290000, quantity: 1, stock: 50, imageUrl: '/src/admin/assets/images/product-1.png', brand: 'Intel' },
  { id: 2, productId: 2, name: 'VGA NVIDIA GeForce RTX 3060 12GB', price: 7490000, quantity: 1, stock: 25, imageUrl: '/src/admin/assets/images/product-2.png', brand: 'NVIDIA' },
  { id: 3, productId: 3, name: 'RAM Corsair Vengeance 16GB DDR4 3200MHz', price: 890000, quantity: 2, stock: 100, imageUrl: '/src/admin/assets/images/product-3.png', brand: 'Corsair' },
];

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const [selectedItems, setSelectedItems] = useState(INITIAL_CART.map(item => item.id));

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleQuantityChange = (itemId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        if (newQty < 1 || newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    if (window.confirm('Bạn có chắc muốn xoá sản phẩm này khỏi giỏ hàng?')) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc muốn xoá toàn bộ giỏ hàng?')) {
      setCartItems([]);
      setSelectedItems([]);
    }
  };

  const handleToggleSelect = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  // ============================================================
  // TÍNH TOÁN
  // ============================================================
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
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
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Giỏ hàng ({cartItems.length})</li>
        </ol>
      </nav>

      <div className="row">
        {/* ============================================================ */}
        {/* CỘT TRÁI — Danh sách sản phẩm */}
        {/* ============================================================ */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm">
            {/* Header */}
            <div className="card-header bg-white py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="selectAll"
                      checked={selectedItems.length === cartItems.length}
                      onChange={handleSelectAll}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="selectAll">
                      Chọn tất cả ({cartItems.length})
                    </label>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={handleClearCart}>
                  <i className="bi bi-trash3 me-1"></i>Xoá tất cả
                </button>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="card-body p-0">
              {cartItems.map((item, index) => (
                <div
                  className={`d-flex align-items-center gap-3 p-4 ${index < cartItems.length - 1 ? 'border-bottom' : ''}`}
                  key={item.id}
                >
                  {/* Checkbox */}
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                    />
                  </div>

                  {/* Ảnh */}
                  <Link to={`/products/${item.productId}`}>
                    <div className="bg-light rounded-3 p-2 flex-shrink-0" style={{ width: '90px', height: '90px' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="img-fluid w-100 h-100"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  </Link>

                  {/* Thông tin */}
                  <div className="flex-grow-1 min-width-0">
                    <Link to={`/products/${item.productId}`} className="text-decoration-none text-dark">
                      <h6 className="fw-bold mb-1" style={{ fontSize: '14px' }}>{item.name}</h6>
                    </Link>
                    <span className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>{item.brand}</span>
                    <div className="d-md-none mt-2">
                      <span className="text-danger fw-bold">{formatCurrency(item.price)}</span>
                    </div>
                  </div>

                  {/* Giá (desktop) */}
                  <div className="text-end d-none d-md-block flex-shrink-0" style={{ minWidth: '120px' }}>
                    <div className="text-danger fw-bold">{formatCurrency(item.price)}</div>
                  </div>

                  {/* Số lượng */}
                  <div className="flex-shrink-0">
                    <div className="input-group input-group-sm" style={{ width: '110px' }}>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleQuantityChange(item.id, -1)}
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
                        onClick={() => handleQuantityChange(item.id, 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>

                  {/* Thành tiền (desktop) */}
                  <div className="text-end d-none d-md-block flex-shrink-0" style={{ minWidth: '130px' }}>
                    <div className="fw-bold text-danger">{formatCurrency(item.price * item.quantity)}</div>
                  </div>

                  {/* Nút xoá */}
                  <button
                    className="btn btn-sm btn-outline-secondary border-0 flex-shrink-0"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Xoá sản phẩm"
                  >
                    <i className="bi bi-x-lg text-muted"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tiếp tục mua sắm */}
          <div className="mt-3">
            <Link to="/products" className="text-decoration-none text-danger fw-medium small">
              <i className="bi bi-arrow-left me-1"></i>Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CỘT PHẢI — Tóm tắt đơn hàng */}
        {/* ============================================================ */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-receipt text-danger me-2"></i>Tóm tắt đơn hàng
              </h5>

              {/* Chi tiết */}
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
              {shippingFee > 0 && (
                <div className="bg-light rounded-2 p-2 mb-2">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>Miễn phí ship cho đơn từ 500.000đ
                  </small>
                </div>
              )}

              <hr />

              {/* Tổng cộng */}
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Tổng cộng</span>
                <span className="fw-bold fs-5 text-danger">{formatCurrency(total)}</span>
              </div>

              {/* Nút thanh toán */}
              <button
                className="btn btn-danger w-100 py-3 fw-bold rounded-3"
                disabled={selectedItems.length === 0}
                onClick={() => navigate('/checkout')}
              >
                <i className="bi bi-bag-check me-2"></i>
                THANH TOÁN ({selectedItems.length} sản phẩm)
              </button>

              {/* Chính sách */}
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-shield-check text-success"></i>
                  <small className="text-muted">Bảo hành chính hãng 100%</small>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-truck text-primary"></i>
                  <small className="text-muted">Giao hàng toàn quốc 1-3 ngày</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-arrow-repeat text-warning"></i>
                  <small className="text-muted">Đổi trả miễn phí trong 7 ngày</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
