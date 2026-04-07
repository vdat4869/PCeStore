import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import { useCart } from '../../context/CartContext';

// ============================================================
// DỮ LIỆU MẪU — Sau này sẽ được thay bằng API thật
// Cấu trúc khớp với ProductResponse từ backend
// ============================================================
const MOCK_CATEGORIES = [
  { id: 1, name: 'CPU - Vi xử lý' },
  { id: 2, name: 'VGA - Card màn hình' },
  { id: 3, name: 'RAM - Bộ nhớ trong' },
  { id: 4, name: 'SSD - Ổ cứng' },
  { id: 5, name: 'Mainboard - Bo mạch chủ' },
  { id: 6, name: 'PSU - Nguồn máy tính' },
  { id: 7, name: 'Case - Vỏ máy tính' },
  { id: 8, name: 'Tản nhiệt' },
];

const MOCK_BRANDS = ['Intel', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Kingston', 'Samsung', 'Western Digital'];

const MOCK_PRODUCTS = [
  { id: 1, name: 'CPU Intel Core i5-12400F', description: 'Vi xử lý Intel thế hệ 12, 6 nhân 12 luồng, xung nhịp 4.4GHz', price: 3290000, stock: 50, categoryId: 1, categoryName: 'CPU - Vi xử lý', brand: 'Intel', imageUrl: '/src/admin/assets/images/product-1.png' },
  { id: 2, name: 'VGA NVIDIA GeForce RTX 3060 12GB', description: 'Card đồ hoạ gaming hiệu năng cao, 12GB GDDR6', price: 7490000, stock: 25, categoryId: 2, categoryName: 'VGA - Card màn hình', brand: 'NVIDIA', imageUrl: '/src/admin/assets/images/product-2.png' },
  { id: 3, name: 'RAM Corsair Vengeance 16GB DDR4 3200MHz', description: 'Bộ nhớ trong DDR4, hiệu năng cao cho gaming và đa nhiệm', price: 890000, stock: 100, categoryId: 3, categoryName: 'RAM - Bộ nhớ trong', brand: 'Corsair', imageUrl: '/src/admin/assets/images/product-3.png' },
  { id: 4, name: 'SSD Samsung 980 PRO 1TB NVMe', description: 'Ổ cứng SSD NVMe PCIe 4.0, tốc độ đọc 7000MB/s', price: 2690000, stock: 40, categoryId: 4, categoryName: 'SSD - Ổ cứng', brand: 'Samsung', imageUrl: '/src/admin/assets/images/product-4.png' },
  { id: 5, name: 'CPU AMD Ryzen 5 5600X', description: 'Vi xử lý AMD 6 nhân 12 luồng, xung nhịp 4.6GHz Boost', price: 3590000, stock: 35, categoryId: 1, categoryName: 'CPU - Vi xử lý', brand: 'AMD', imageUrl: '/src/admin/assets/images/product-5.png' },
  { id: 6, name: 'Mainboard ASUS ROG STRIX B550-F', description: 'Bo mạch chủ AMD B550, hỗ trợ PCIe 4.0, WiFi 6', price: 4190000, stock: 20, categoryId: 5, categoryName: 'Mainboard - Bo mạch chủ', brand: 'ASUS', imageUrl: '/src/admin/assets/images/product-6.png' },
  { id: 7, name: 'VGA MSI GeForce RTX 4060 VENTUS 2X', description: 'Card đồ hoạ thế hệ mới, kiến trúc Ada Lovelace, 8GB GDDR6', price: 8290000, stock: 15, categoryId: 2, categoryName: 'VGA - Card màn hình', brand: 'MSI', imageUrl: '/src/admin/assets/images/product-7.png' },
  { id: 8, name: 'RAM Kingston Fury Beast 32GB DDR5 5600MHz', description: 'Bộ nhớ DDR5 thế hệ mới, tốc độ cao, tản nhiệt hiệu quả', price: 2190000, stock: 60, categoryId: 3, categoryName: 'RAM - Bộ nhớ trong', brand: 'Kingston', imageUrl: '/src/admin/assets/images/product-8.png' },
  { id: 9, name: 'SSD Western Digital Black SN770 500GB', description: 'Ổ cứng NVMe Gen4, tốc độ đọc 5000MB/s, phù hợp gaming', price: 1290000, stock: 80, categoryId: 4, categoryName: 'SSD - Ổ cứng', brand: 'Western Digital', imageUrl: '/src/admin/assets/images/product-9.png' },
  { id: 10, name: 'PSU Corsair RM750e 750W 80+ Gold', description: 'Nguồn máy tính modular, hiệu suất 80+ Gold, quạt im lặng', price: 2390000, stock: 30, categoryId: 6, categoryName: 'PSU - Nguồn máy tính', brand: 'Corsair', imageUrl: '/src/admin/assets/images/product-10.png' },
  { id: 11, name: 'Case Gigabyte C200 Glass', description: 'Vỏ máy tính ATX, mặt kính cường lực, hỗ trợ tản nhiệt nước', price: 1190000, stock: 45, categoryId: 7, categoryName: 'Case - Vỏ máy tính', brand: 'Gigabyte', imageUrl: '/src/admin/assets/images/product-1.png' },
  { id: 12, name: 'Tản nhiệt ID-Cooling SE-226-XT', description: 'Tản nhiệt khí tower, 6 ống đồng, hỗ trợ Intel & AMD', price: 590000, stock: 70, categoryId: 8, categoryName: 'Tản nhiệt', brand: 'AMD', imageUrl: '/src/admin/assets/images/product-2.png' },
];

// ============================================================
// CONSTANTS
// ============================================================
const ITEMS_PER_PAGE = 8;

const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'name-asc', label: 'Tên: A → Z' },
  { value: 'name-desc', label: 'Tên: Z → A' },
  { value: 'newest', label: 'Mới nhất' },
];

export default function Product() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State cho bộ lọc & tìm kiếm
  const [keyword, setKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'list'
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    });
    setToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setTimeout(() => setToast(null), 2500);
  };

  // ============================================================
  // LỌC & SẮP XẾP SẢN PHẨM
  // ============================================================
  const filteredProducts = useMemo(() => {
    let results = [...MOCK_PRODUCTS];

    // Lọc theo từ khoá tìm kiếm
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw) ||
        p.brand.toLowerCase().includes(kw)
      );
    }

    // Lọc theo danh mục
    if (selectedCategories.length > 0) {
      results = results.filter(p => selectedCategories.includes(p.categoryId));
    }

    // Lọc theo thương hiệu
    if (selectedBrands.length > 0) {
      results = results.filter(p => selectedBrands.includes(p.brand));
    }

    // Lọc theo khoảng giá
    if (priceRange.min !== '') {
      results = results.filter(p => p.price >= Number(priceRange.min));
    }
    if (priceRange.max !== '') {
      results = results.filter(p => p.price <= Number(priceRange.max));
    }

    // Sắp xếp
    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        results.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return results;
  }, [keyword, selectedCategories, selectedBrands, priceRange, sortBy]);

  // ============================================================
  // PHÂN TRANG
  // ============================================================
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const handlePriceChange = (field, value) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
    setSortBy('default');
    setCurrentPage(1);
  };

  const activeFilterCount = selectedCategories.length + selectedBrands.length +
    (priceRange.min !== '' ? 1 : 0) + (priceRange.max !== '' ? 1 : 0);

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#323232', color: '#fff', padding: '0.75rem 1.5rem',
          borderRadius: '8px', zIndex: 9999, fontSize: '0.9rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
          animation: 'fadeIn 0.3s ease'
        }}>
          <i className="bi bi-cart-check me-2 text-success"></i>{toast}
        </div>
      )}

      <div className="container pb-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Sản phẩm</li>
        </ol>
      </nav>

      <div className="row">
        {/* ============================================================ */}
        {/* SIDEBAR — Bộ lọc */}
        {/* ============================================================ */}
        <aside className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {/* Header bộ lọc */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  <i className="bi bi-funnel me-2"></i>Bộ lọc
                </h6>
                {activeFilterCount > 0 && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={handleClearFilters}
                  >
                    <i className="bi bi-x-lg me-1"></i>Xoá ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Lọc theo Danh mục */}
              <div className="mb-4">
                <h6 className="fw-semibold small text-uppercase text-secondary mb-2">
                  <i className="bi bi-grid me-1"></i>Danh mục
                </h6>
                {MOCK_CATEGORIES.map(cat => (
                  <div className="form-check mb-1" key={cat.id}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`cat-${cat.id}`}
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryToggle(cat.id)}
                    />
                    <label className="form-check-label small" htmlFor={`cat-${cat.id}`}>
                      {cat.name}
                    </label>
                  </div>
                ))}
              </div>

              <hr />

              {/* Lọc theo Khoảng giá */}
              <div className="mb-4">
                <h6 className="fw-semibold small text-uppercase text-secondary mb-2">
                  <i className="bi bi-cash-stack me-1"></i>Khoảng giá
                </h6>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Từ"
                      value={priceRange.min}
                      onChange={e => handlePriceChange('min', e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Đến"
                      value={priceRange.max}
                      onChange={e => handlePriceChange('max', e.target.value)}
                    />
                  </div>
                </div>
                {/* Quick price buttons */}
                <div className="d-flex flex-wrap gap-1 mt-2">
                  {[
                    { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
                    { label: '1 - 5 triệu', min: 1000000, max: 5000000 },
                    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
                    { label: 'Trên 10 triệu', min: 10000000, max: '' },
                  ].map((range, idx) => (
                    <button
                      key={idx}
                      className="btn btn-outline-secondary btn-sm py-0 px-2"
                      style={{ fontSize: '11px' }}
                      onClick={() => {
                        setPriceRange({ min: range.min || '', max: range.max || '' });
                        setCurrentPage(1);
                      }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <hr />

              {/* Lọc theo Thương hiệu */}
              <div className="mb-2">
                <h6 className="fw-semibold small text-uppercase text-secondary mb-2">
                  <i className="bi bi-building me-1"></i>Thương hiệu
                </h6>
                {MOCK_BRANDS.map(brand => (
                  <div className="form-check mb-1" key={brand}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                    <label className="form-check-label small" htmlFor={`brand-${brand}`}>
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* NỘI DUNG CHÍNH — Danh sách sản phẩm */}
        {/* ============================================================ */}
        <main className="col-lg-9">
          {/* Thanh công cụ: Tìm kiếm + Sắp xếp + Chế độ xem */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body py-3">
              <div className="row align-items-center g-2">
                {/* Tìm kiếm */}
                <div className="col-12 col-md-5">
                  <form onSubmit={handleSearch}>
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={keyword}
                        onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
                      />
                      <button className="btn btn-danger" type="submit">
                        <i className="bi bi-search"></i>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Kết quả */}
                <div className="col-12 col-md-3 text-muted small">
                  Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
                </div>

                {/* Sắp xếp + Chế độ xem */}
                <div className="col-12 col-md-4 d-flex align-items-center gap-2 justify-content-md-end">
                  <select
                    className="form-select form-select-sm"
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    style={{ maxWidth: '170px' }}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {/* Toggle Grid / List */}
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      className={`btn ${viewMode === 'grid' ? 'btn-danger' : 'btn-outline-secondary'}`}
                      onClick={() => setViewMode('grid')}
                      title="Dạng lưới"
                    >
                      <i className="bi bi-grid-3x3-gap-fill"></i>
                    </button>
                    <button
                      className={`btn ${viewMode === 'list' ? 'btn-danger' : 'btn-outline-secondary'}`}
                      onClick={() => setViewMode('list')}
                      title="Dạng danh sách"
                    >
                      <i className="bi bi-list-ul"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          {paginatedProducts.length === 0 ? (
            /* Trạng thái không tìm thấy */
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
                <h5 className="text-muted">Không tìm thấy sản phẩm</h5>
                <p className="text-secondary small mb-3">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
                <button className="btn btn-outline-danger btn-sm" onClick={handleClearFilters}>
                  <i className="bi bi-arrow-counterclockwise me-1"></i>Xoá bộ lọc
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* ===== CHẾ ĐỘ GRID ===== */
            <div className="row">
              {paginatedProducts.map(product => (
                <div className="col-6 col-md-4 col-xl-3 mb-4" key={product.id}>
                  <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
                    <div className="card h-100 product-card position-relative overflow-hidden bg-white border-0 shadow-sm">
                      {/* Badge tồn kho */}
                      {product.stock <= 10 && product.stock > 0 && (
                        <span className="position-absolute top-0 end-0 bg-warning text-dark px-2 py-1 small fw-bold"
                          style={{ zIndex: 1, borderBottomLeftRadius: '8px', fontSize: '11px' }}>
                          Sắp hết
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="position-absolute top-0 end-0 bg-secondary text-white px-2 py-1 small fw-bold"
                          style={{ zIndex: 1, borderBottomLeftRadius: '8px', fontSize: '11px' }}>
                          Hết hàng
                        </span>
                      )}

                      {/* Ảnh sản phẩm */}
                      <div className="text-center p-3 bg-light">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="img-fluid"
                          style={{ height: '160px', objectFit: 'contain' }}
                        />
                      </div>

                      {/* Thông tin */}
                      <div className="card-body d-flex flex-column p-3">
                        {/* Danh mục */}
                        <span className="text-muted small mb-1" style={{ fontSize: '11px' }}>
                          {product.categoryName}
                        </span>

                        {/* Tên sản phẩm */}
                        <h6 className="card-title fw-bold mb-2" style={{ 
                          fontSize: '14px', 
                          minHeight: '40px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {product.name}
                        </h6>

                        {/* Thương hiệu */}
                        <span className="badge bg-light text-dark border mb-2 align-self-start" style={{ fontSize: '10px' }}>
                          {product.brand}
                        </span>

                        {/* Giá */}
                        <div className="mt-auto">
                          <div className="text-danger fw-bold fs-6">
                            {formatCurrency(product.price)}
                          </div>
                        </div>

                        {/* Trạng thái kho */}
                        <div className="mt-2">
                          {product.stock > 10 ? (
                            <small className="text-success"><i className="bi bi-check-circle-fill me-1"></i>Còn hàng</small>
                          ) : product.stock > 0 ? (
                            <small className="text-warning"><i className="bi bi-exclamation-circle-fill me-1"></i>Còn {product.stock} sản phẩm</small>
                          ) : (
                            <small className="text-secondary"><i className="bi bi-x-circle-fill me-1"></i>Hết hàng</small>
                          )}
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="card-footer bg-white border-top-0 p-3 pt-0">
                        <button
                          className="btn btn-outline-danger btn-sm w-100 fw-semibold"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={product.stock === 0}
                        >
                          <i className="bi bi-cart-plus me-1"></i>Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            /* ===== CHẾ ĐỘ LIST ===== */
            <div className="d-flex flex-column gap-3">
              {paginatedProducts.map(product => (
                <Link to={`/products/${product.id}`} className="text-decoration-none text-dark" key={product.id}>
                  <div className="card product-card border-0 shadow-sm overflow-hidden">
                    <div className="row g-0">
                      {/* Ảnh */}
                      <div className="col-3 col-md-2 d-flex align-items-center justify-content-center bg-light p-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="img-fluid"
                          style={{ maxHeight: '120px', objectFit: 'contain' }}
                        />
                      </div>

                      {/* Thông tin */}
                      <div className="col-9 col-md-10">
                        <div className="card-body d-flex flex-column flex-md-row align-items-md-center gap-2">
                          <div className="flex-grow-1">
                            <span className="text-muted small">{product.categoryName}</span>
                            <h6 className="fw-bold mb-1">{product.name}</h6>
                            <p className="text-muted small mb-1 d-none d-md-block" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {product.description}
                            </p>
                            <span className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>
                              {product.brand}
                            </span>
                          </div>

                          <div className="text-md-end d-flex flex-md-column align-items-center align-items-md-end gap-2">
                            <span className="text-danger fw-bold fs-5">{formatCurrency(product.price)}</span>
                            {product.stock > 0 ? (
                              <small className="text-success"><i className="bi bi-check-circle-fill me-1"></i>Còn hàng</small>
                            ) : (
                              <small className="text-secondary"><i className="bi bi-x-circle-fill me-1"></i>Hết hàng</small>
                            )}
                            <button
                              className="btn btn-outline-danger btn-sm fw-semibold"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              disabled={product.stock === 0}
                            >
                              <i className="bi bi-cart-plus me-1"></i>Thêm vào giỏ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ============================================================ */}
          {/* PHÂN TRANG */}
          {/* ============================================================ */}
          {totalPages > 1 && (
            <nav aria-label="Product pagination" className="mt-4">
              <ul className="pagination justify-content-center mb-0">
                {/* Nút Trước */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>

                {/* Các số trang */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li className={`page-item ${page === currentPage ? 'active' : ''}`} key={page}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                      style={page === currentPage ? { backgroundColor: '#dc3545', borderColor: '#dc3545' } : {}}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                {/* Nút Sau */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </main>
      </div>
    </div>
    </>
  );
}
