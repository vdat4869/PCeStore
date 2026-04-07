import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import { useCart } from '../../context/CartContext';

// ============================================================
// DỮ LIỆU MẪU — Khớp với ProductResponse backend
// Sau này sẽ được thay bằng API: GET /api/products/{id}
// ============================================================
const MOCK_PRODUCTS = [
  { id: 1, name: 'CPU Intel Core i5-12400F', description: 'Vi xử lý Intel Alder Lake thế hệ 12, 6 nhân 12 luồng, xung nhịp cơ bản 2.5GHz, Turbo Boost lên đến 4.4GHz. Socket LGA 1700, TDP 65W. Hỗ trợ RAM DDR4/DDR5, PCIe 5.0. Lý tưởng cho gaming và đa tác vụ với hiệu năng vượt trội trong tầm giá.', price: 3290000, stock: 50, categoryId: 1, categoryName: 'CPU - Vi xử lý', brand: 'Intel', imageUrl: '/src/admin/assets/images/product-1.png', specs: { 'Socket': 'LGA 1700', 'Số nhân / Luồng': '6 nhân / 12 luồng', 'Xung nhịp cơ bản': '2.5 GHz', 'Xung Turbo Boost': '4.4 GHz', 'Cache': '18MB Intel Smart Cache', 'TDP': '65W', 'Hỗ trợ RAM': 'DDR4-3200 / DDR5-4800', 'Kiến trúc': 'Alder Lake', 'Tiến trình': 'Intel 7 (10nm)' } },
  { id: 2, name: 'VGA NVIDIA GeForce RTX 3060 12GB', description: 'Card đồ hoạ gaming hiệu năng cao với kiến trúc Ampere, 12GB GDDR6, 3584 CUDA Cores. Hỗ trợ Ray Tracing, DLSS thế hệ 2. Cổng xuất hình HDMI 2.1, 3x DisplayPort 1.4a. Hoàn hảo cho gaming 1080p/1440p và các tác vụ đồ hoạ, render video.', price: 7490000, stock: 25, categoryId: 2, categoryName: 'VGA - Card màn hình', brand: 'NVIDIA', imageUrl: '/src/admin/assets/images/product-2.png', specs: { 'GPU': 'NVIDIA GeForce RTX 3060', 'VRAM': '12GB GDDR6', 'Bus Width': '192-bit', 'CUDA Cores': '3584', 'Xung nhịp Boost': '1777 MHz', 'Ray Tracing': 'Có (RT Cores Gen 2)', 'DLSS': 'Có (DLSS 2.0)', 'TDP': '170W', 'Cổng xuất': 'HDMI 2.1, 3x DP 1.4a' } },
  { id: 3, name: 'RAM Corsair Vengeance 16GB DDR4 3200MHz', description: 'Bộ nhớ trong DDR4 16GB (2x8GB) bus 3200MHz, tản nhiệt nhôm cao cấp. Hỗ trợ XMP 2.0 để ép xung dễ dàng. Tương thích rộng rãi với các bo mạch chủ Intel và AMD. Hiệu năng ổn định cho gaming, streaming và đa nhiệm.', price: 890000, stock: 100, categoryId: 3, categoryName: 'RAM - Bộ nhớ trong', brand: 'Corsair', imageUrl: '/src/admin/assets/images/product-3.png', specs: { 'Dung lượng': '16GB (2x8GB)', 'Loại': 'DDR4', 'Bus Speed': '3200 MHz', 'CAS Latency': 'CL16', 'Điện áp': '1.35V', 'XMP': 'Có (XMP 2.0)', 'Tản nhiệt': 'Nhôm anodized', 'Tương thích': 'Intel & AMD' } },
  { id: 4, name: 'SSD Samsung 980 PRO 1TB NVMe', description: 'Ổ cứng SSD NVMe PCIe Gen 4.0 x4 với tốc độ đọc tuần tự lên đến 7,000 MB/s và ghi 5,000 MB/s. Sử dụng chip V-NAND 3-bit MLC, controller Samsung Elpis. Bền bỉ với chỉ số TBW 600TB. Lý tưởng cho PC gaming, workstation và các tác vụ nặng.', price: 2690000, stock: 40, categoryId: 4, categoryName: 'SSD - Ổ cứng', brand: 'Samsung', imageUrl: '/src/admin/assets/images/product-4.png', specs: { 'Dung lượng': '1TB', 'Giao tiếp': 'PCIe Gen 4.0 x4, NVMe 1.3c', 'Form Factor': 'M.2 2280', 'Tốc độ đọc': '7,000 MB/s', 'Tốc độ ghi': '5,000 MB/s', 'IOPS đọc': '1,000,000', 'IOPS ghi': '1,000,000', 'Độ bền (TBW)': '600 TB', 'Bảo hành': '5 năm' } },
  { id: 5, name: 'CPU AMD Ryzen 5 5600X', description: 'Vi xử lý AMD Zen 3, 6 nhân 12 luồng, xung nhịp cơ bản 3.7GHz, Boost lên 4.6GHz. Socket AM4, TDP 65W. Đi kèm tản nhiệt Wraith Stealth. Hiệu năng đơn nhân xuất sắc, phù hợp cho gaming và sáng tạo nội dung.', price: 3590000, stock: 35, categoryId: 1, categoryName: 'CPU - Vi xử lý', brand: 'AMD', imageUrl: '/src/admin/assets/images/product-5.png', specs: { 'Socket': 'AM4', 'Số nhân / Luồng': '6 nhân / 12 luồng', 'Xung nhịp cơ bản': '3.7 GHz', 'Xung Boost': '4.6 GHz', 'Cache': '32MB L3 Cache', 'TDP': '65W', 'Kiến trúc': 'Zen 3', 'Tiến trình': '7nm TSMC', 'Tản nhiệt kèm': 'Wraith Stealth' } },
  { id: 6, name: 'Mainboard ASUS ROG STRIX B550-F', description: 'Bo mạch chủ AMD B550 cao cấp với thiết kế nguồn 12+2 pha, hỗ trợ PCIe 4.0, WiFi 6 (802.11ax), USB 3.2 Gen 2 Type-C. Âm thanh SupremeFX S1220A. Aura Sync RGB. Form factor ATX, phù hợp cho PC gaming cao cấp.', price: 4190000, stock: 20, categoryId: 5, categoryName: 'Mainboard - Bo mạch chủ', brand: 'ASUS', imageUrl: '/src/admin/assets/images/product-6.png', specs: { 'Chipset': 'AMD B550', 'Socket': 'AM4', 'Form Factor': 'ATX', 'RAM Slots': '4x DDR4 (tối đa 128GB)', 'PCIe': '1x PCIe 4.0 x16, 1x PCIe 3.0 x16', 'Khe M.2': '2x M.2 (PCIe 4.0 + 3.0)', 'USB': 'USB 3.2 Gen 2 Type-C', 'WiFi': 'WiFi 6 (802.11ax)', 'Âm thanh': 'SupremeFX S1220A' } },
  { id: 7, name: 'VGA MSI GeForce RTX 4060 VENTUS 2X', description: 'Card đồ hoạ thế hệ mới, kiến trúc Ada Lovelace, 8GB GDDR6. Hỗ trợ DLSS 3.0 với Frame Generation, Ray Tracing Gen 3. Hiệu năng điện năng tuyệt vời với TDP chỉ 115W. Tản nhiệt kép VENTUS quạt TORX 4.0 siêu mát, siêu êm.', price: 8290000, stock: 15, categoryId: 2, categoryName: 'VGA - Card màn hình', brand: 'MSI', imageUrl: '/src/admin/assets/images/product-7.png', specs: { 'GPU': 'NVIDIA GeForce RTX 4060', 'VRAM': '8GB GDDR6', 'Bus Width': '128-bit', 'CUDA Cores': '3072', 'Xung nhịp Boost': '2460 MHz', 'Ray Tracing': 'Có (RT Cores Gen 3)', 'DLSS': 'Có (DLSS 3.0 + Frame Gen)', 'TDP': '115W', 'Tản nhiệt': 'VENTUS 2X (TORX 4.0)' } },
  { id: 8, name: 'RAM Kingston Fury Beast 32GB DDR5 5600MHz', description: 'Bộ nhớ DDR5 32GB (2x16GB) bus 5600MHz, thiết kế tản nhiệt thấp profile. Hỗ trợ Intel XMP 3.0, tích hợp mô-đun quản lý nguồn PMIC trên bo mạch. Hiệu năng cực cao cho gaming AAA và workstation chuyên nghiệp.', price: 2190000, stock: 60, categoryId: 3, categoryName: 'RAM - Bộ nhớ trong', brand: 'Kingston', imageUrl: '/src/admin/assets/images/product-8.png', specs: { 'Dung lượng': '32GB (2x16GB)', 'Loại': 'DDR5', 'Bus Speed': '5600 MHz', 'CAS Latency': 'CL36', 'Điện áp': '1.25V', 'XMP': 'Có (Intel XMP 3.0)', 'PMIC': 'Tích hợp on-die', 'Tản nhiệt': 'Nhôm low-profile' } },
  { id: 9, name: 'SSD Western Digital Black SN770 500GB', description: 'Ổ cứng NVMe Gen4 500GB, tốc độ đọc 5,000MB/s, ghi 4,000MB/s. Thiết kế không tản nhiệt, tiết kiệm không gian. Game Mode 2.0 tối ưu cho gaming. Phù hợp làm ổ hệ thống hoặc bổ sung lưu trữ cho laptop và PC.', price: 1290000, stock: 80, categoryId: 4, categoryName: 'SSD - Ổ cứng', brand: 'Western Digital', imageUrl: '/src/admin/assets/images/product-9.png', specs: { 'Dung lượng': '500GB', 'Giao tiếp': 'PCIe Gen 4.0 x4, NVMe', 'Form Factor': 'M.2 2280', 'Tốc độ đọc': '5,000 MB/s', 'Tốc độ ghi': '4,000 MB/s', 'Độ bền (TBW)': '300 TB', 'Tính năng': 'Game Mode 2.0', 'Bảo hành': '5 năm' } },
  { id: 10, name: 'PSU Corsair RM750e 750W 80+ Gold', description: 'Nguồn máy tính 750W chuẩn 80+ Gold, hiệu suất chuyển đổi lên đến 92%. Thiết kế full modular giúp gọn cáp, quạt 120mm Fluid Dynamic Bearing cực êm với chế độ Zero RPM Fan Mode. Bảo vệ đầy đủ: OVP, UVP, SCP, OPP, OTP.', price: 2390000, stock: 30, categoryId: 6, categoryName: 'PSU - Nguồn máy tính', brand: 'Corsair', imageUrl: '/src/admin/assets/images/product-10.png', specs: { 'Công suất': '750W', 'Chứng nhận': '80+ Gold', 'Modular': 'Full Modular', 'Quạt': '120mm FDB', 'Zero RPM': 'Có', 'Rail +12V': 'Single Rail (62.5A)', 'Bảo vệ': 'OVP, UVP, SCP, OPP, OTP', 'Chuẩn ATX': 'ATX 3.0', 'Bảo hành': '10 năm' } },
  { id: 11, name: 'Case Gigabyte C200 Glass', description: 'Vỏ máy tính ATX mid-tower với mặt kính cường lực bên hông, thiết kế hiện đại. Hỗ trợ tản nhiệt nước 240/280mm phía trước, khay lắp ổ cứng linh hoạt. Tích hợp 1 quạt ARGB phía trước và 1 quạt phía sau, bộ lọc bụi từ tính.', price: 1190000, stock: 45, categoryId: 7, categoryName: 'Case - Vỏ máy tính', brand: 'Gigabyte', imageUrl: '/src/admin/assets/images/product-1.png', specs: { 'Form Factor': 'ATX Mid-Tower', 'Mặt kính': 'Kính cường lực 4mm', 'Mainboard': 'ATX / Micro-ATX / Mini-ITX', 'Tản nhiệt': 'Hỗ trợ 240/280mm AIO', 'Quạt kèm': '1x ARGB (trước) + 1x (sau)', 'Khay ổ': '2x 3.5" + 2x 2.5"', 'VGA tối đa': '330mm', 'CPU Cooler': 'Tối đa 165mm', 'PSU': 'ATX, tối đa 180mm' } },
  { id: 12, name: 'Tản nhiệt ID-Cooling SE-226-XT', description: 'Tản nhiệt khí dạng tower với 6 ống đồng tiếp xúc trực tiếp, quạt 120mm hỗ trợ PWM. Tương thích socket Intel LGA 1700/1200/115x và AMD AM5/AM4. Hiệu năng làm mát TDP lên đến 250W, phù hợp cho CPU gaming và workstation.', price: 590000, stock: 70, categoryId: 8, categoryName: 'Tản nhiệt', brand: 'AMD', imageUrl: '/src/admin/assets/images/product-2.png', specs: { 'Loại': 'Tower Air Cooler', 'Ống đồng': '6 ống (Direct Touch)', 'Quạt': '120mm PWM', 'Tốc độ quạt': '700 ~ 1800 RPM', 'Luồng gió': '76.16 CFM', 'Độ ồn': '15.2 ~ 28.3 dBA', 'TDP hỗ trợ': '250W', 'Socket Intel': 'LGA 1700/1200/115x', 'Socket AMD': 'AM5/AM4' } },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [toast, setToast] = useState(null);

  // Tìm sản phẩm theo ID
  const product = MOCK_PRODUCTS.find(p => p.id === Number(id));

  // Sản phẩm liên quan (cùng danh mục, loại trừ SP hiện tại)
  const relatedProducts = product
    ? MOCK_PRODUCTS.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4)
    : [];

  // Xử lý tăng/giảm số lượng
  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product && next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity,
    });
    setToast(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng!`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity,
    });
    navigate('/cart');
  };

  // ============================================================
  // KHÔNG TÌM THẤY SẢN PHẨM
  // ============================================================
  if (!product) {
    return (
      <div className="container py-5">
        {/* toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: '#323232', color: '#fff', padding: '0.75rem 1.5rem',
            borderRadius: '8px', zIndex: 9999, fontSize: '0.9rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
          }}>
            <i className="bi bi-cart-check me-2 text-success"></i>{toast}
          </div>
        )}
        <div className="text-center py-5">
          <i className="bi bi-box-seam fs-1 text-muted d-block mb-3"></i>
          <h3 className="text-muted">Không tìm thấy sản phẩm</h3>
          <p className="text-secondary mb-4">Sản phẩm không tồn tại hoặc đã bị xoá</p>
          <Link to="/products" className="btn btn-danger">
            <i className="bi bi-arrow-left me-2"></i>Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#323232', color: '#fff', padding: '0.75rem 1.5rem',
          borderRadius: '8px', zIndex: 9999, fontSize: '0.9rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
        }}>
          <i className="bi bi-cart-check me-2 text-success"></i>{toast}
        </div>
      )}
      <div className="container pb-5">
      {/* ============================================================ */}
      {/* BREADCRUMB */}
      {/* ============================================================ */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">Sản phẩm</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/products?category=${product.categoryId}`} className="text-decoration-none">
              {product.categoryName}
            </Link>
          </li>
          <li className="breadcrumb-item active text-truncate" aria-current="page" style={{ maxWidth: '250px' }}>
            {product.name}
          </li>
        </ol>
      </nav>

      {/* ============================================================ */}
      {/* THÔNG TIN SẢN PHẨM CHÍNH */}
      {/* ============================================================ */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row">
            {/* === CỘT TRÁI: Hình ảnh === */}
            <div className="col-lg-5 mb-4 mb-lg-0">
              <div className="bg-light rounded-3 p-4 text-center position-relative" style={{ minHeight: '350px' }}>
                {/* Badge trạng thái */}
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="position-absolute top-0 start-0 m-3 badge bg-warning text-dark">
                    <i className="bi bi-exclamation-triangle me-1"></i>Chỉ còn {product.stock}
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="position-absolute top-0 start-0 m-3 badge bg-secondary">
                    <i className="bi bi-x-circle me-1"></i>Hết hàng
                  </span>
                )}

                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="img-fluid"
                  style={{ maxHeight: '320px', objectFit: 'contain' }}
                />
              </div>

              {/* Thumbnail placeholder — Khi có nhiều ảnh sẽ dùng */}
              <div className="d-flex gap-2 mt-3 justify-content-center">
                <div className="border rounded p-1 bg-light" style={{ width: '64px', height: '64px', cursor: 'pointer' }}>
                  <img src={product.imageUrl} alt="" className="img-fluid h-100 w-100" style={{ objectFit: 'contain' }} />
                </div>
              </div>
            </div>

            {/* === CỘT PHẢI: Thông tin === */}
            <div className="col-lg-7">
              {/* Danh mục & Thương hiệu */}
              <div className="d-flex align-items-center gap-2 mb-2">
                <Link
                  to={`/products?category=${product.categoryId}`}
                  className="badge bg-danger bg-opacity-10 text-danger text-decoration-none"
                >
                  {product.categoryName}
                </Link>
                <span className="badge bg-light text-dark border">{product.brand}</span>
              </div>

              {/* Tên sản phẩm */}
              <h1 className="h3 fw-bold mb-3" style={{ color: '#2b3452' }}>{product.name}</h1>

              {/* Mã sản phẩm & Đánh giá */}
              <div className="d-flex align-items-center gap-3 mb-3 text-muted small">
                <span>
                  <i className="bi bi-upc-scan me-1"></i>Mã SP: <strong>PRD{String(product.id).padStart(3, '0')}</strong>
                </span>
                <span className="text-secondary">|</span>
                <span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <i key={star} className={`bi bi-star${star <= 4 ? '-fill text-warning' : ' text-muted'}`}></i>
                  ))}
                  <span className="ms-1">(0 đánh giá)</span>
                </span>
              </div>

              <hr />

              {/* Giá */}
              <div className="mb-4">
                <div className="d-flex align-items-end gap-3">
                  <span className="text-danger fw-bold" style={{ fontSize: '28px' }}>
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1 text-success"></i>Bảo hành chính hãng
                </small>
              </div>

              {/* Thông tin nhanh */}
              <div className="bg-light rounded-3 p-3 mb-4">
                <h6 className="fw-semibold mb-2">
                  <i className="bi bi-info-circle text-primary me-2"></i>Thông tin nhanh
                </h6>
                <div className="row g-2">
                  {Object.entries(product.specs || {}).slice(0, 4).map(([key, value]) => (
                    <div className="col-6" key={key}>
                      <small className="text-muted d-block">{key}</small>
                      <small className="fw-semibold">{value}</small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trạng thái kho */}
              <div className="mb-4">
                {product.stock > 10 ? (
                  <span className="text-success fw-medium">
                    <i className="bi bi-check-circle-fill me-1"></i>Còn hàng ({product.stock} sản phẩm)
                  </span>
                ) : product.stock > 0 ? (
                  <span className="text-warning fw-medium">
                    <i className="bi bi-exclamation-circle-fill me-1"></i>Sắp hết — Chỉ còn {product.stock} sản phẩm
                  </span>
                ) : (
                  <span className="text-secondary fw-medium">
                    <i className="bi bi-x-circle-fill me-1"></i>Tạm hết hàng
                  </span>
                )}
              </div>

              {/* Chọn số lượng */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="fw-medium text-secondary">Số lượng:</span>
                <div className="input-group" style={{ width: '140px' }}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <input
                    type="text"
                    className="form-control text-center fw-bold"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="d-flex gap-3 flex-wrap">
                <button
                  className="btn btn-danger btn-lg fw-bold px-5"
                  disabled={product.stock === 0}
                  onClick={handleBuyNow}
                >
                  <i className="bi bi-bag-check me-2"></i>MUA NGAY
                </button>
                <button
                  className="btn btn-outline-danger btn-lg fw-bold px-4"
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  <i className="bi bi-cart-plus me-2"></i>THÊM VÀO GIỎ
                </button>
              </div>

              {/* Chính sách */}
              <div className="row g-3 mt-4 pt-3 border-top">
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <i className="bi bi-truck text-danger fs-4 d-block mb-1"></i>
                    <small className="text-muted">Giao hàng<br/>toàn quốc</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <i className="bi bi-shield-check text-danger fs-4 d-block mb-1"></i>
                    <small className="text-muted">Bảo hành<br/>chính hãng</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <i className="bi bi-arrow-repeat text-danger fs-4 d-block mb-1"></i>
                    <small className="text-muted">Đổi trả<br/>7 ngày</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <i className="bi bi-headset text-danger fs-4 d-block mb-1"></i>
                    <small className="text-muted">Hỗ trợ<br/>24/7</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TABS: Mô tả & Thông số kỹ thuật */}
      {/* ============================================================ */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom-0 pt-3 px-4">
          <ul className="nav nav-tabs border-0" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'description' ? 'active text-danger' : 'text-secondary'}`}
                onClick={() => setActiveTab('description')}
                style={activeTab === 'description' ? { borderBottomColor: '#dc3545', borderBottomWidth: '2px' } : {}}
              >
                <i className="bi bi-file-text me-1"></i>Mô tả sản phẩm
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'specs' ? 'active text-danger' : 'text-secondary'}`}
                onClick={() => setActiveTab('specs')}
                style={activeTab === 'specs' ? { borderBottomColor: '#dc3545', borderBottomWidth: '2px' } : {}}
              >
                <i className="bi bi-cpu me-1"></i>Thông số kỹ thuật
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'reviews' ? 'active text-danger' : 'text-secondary'}`}
                onClick={() => setActiveTab('reviews')}
                style={activeTab === 'reviews' ? { borderBottomColor: '#dc3545', borderBottomWidth: '2px' } : {}}
              >
                <i className="bi bi-chat-left-dots me-1"></i>Đánh giá (0)
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-4">
          {/* Tab: Mô tả */}
          {activeTab === 'description' && (
            <div>
              <p className="text-secondary lh-lg" style={{ whiteSpace: 'pre-line' }}>
                {product.description}
              </p>

              <div className="bg-light rounded-3 p-3 mt-3">
                <h6 className="fw-semibold mb-2"><i className="bi bi-gift text-danger me-2"></i>Ưu đãi khi mua hàng</h6>
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>Miễn phí giao hàng cho đơn từ 500.000đ</li>
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>Tích điểm thành viên cho mỗi đơn hàng</li>
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab: Thông số kỹ thuật */}
          {activeTab === 'specs' && (
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <tbody>
                  {Object.entries(product.specs || {}).map(([key, value], index) => (
                    <tr key={index}>
                      <td className="fw-semibold text-secondary" style={{ width: '35%' }}>
                        {key}
                      </td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab: Đánh giá */}
          {activeTab === 'reviews' && (
            <div className="text-center py-5">
              <i className="bi bi-chat-square-text fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted">Chưa có đánh giá nào</h5>
              <p className="text-secondary small mb-3">Hãy là người đầu tiên đánh giá sản phẩm này</p>
              <button className="btn btn-outline-danger btn-sm">
                <i className="bi bi-pencil me-1"></i>Viết đánh giá
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SẢN PHẨM LIÊN QUAN */}
      {/* ============================================================ */}
      {relatedProducts.length > 0 && (
        <div>
          <h4 className="fw-bold mb-3">
            <i className="bi bi-collection text-danger me-2"></i>Sản phẩm liên quan
          </h4>
          <div className="row">
            {relatedProducts.map(rp => (
              <div className="col-6 col-md-3 mb-4" key={rp.id}>
                <Link to={`/products/${rp.id}`} className="text-decoration-none text-dark">
                  <div className="card h-100 product-card border-0 shadow-sm overflow-hidden">
                    <div className="text-center p-3 bg-light">
                      <img
                        src={rp.imageUrl}
                        alt={rp.name}
                        className="img-fluid"
                        style={{ height: '140px', objectFit: 'contain' }}
                      />
                    </div>
                    <div className="card-body p-3">
                      <span className="text-muted small" style={{ fontSize: '11px' }}>{rp.categoryName}</span>
                      <h6 className="fw-bold mt-1" style={{
                        fontSize: '13px',
                        minHeight: '36px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {rp.name}
                      </h6>
                      <div className="text-danger fw-bold">{formatCurrency(rp.price)}</div>
                      {rp.stock > 0 ? (
                        <small className="text-success"><i className="bi bi-check-circle-fill me-1"></i>Còn hàng</small>
                      ) : (
                        <small className="text-secondary"><i className="bi bi-x-circle-fill me-1"></i>Hết hàng</small>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
