import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'name-asc', label: 'Tên: A → Z' },
  { value: 'name-desc', label: 'Tên: Z → A' },
];

export default function Product() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // State cục bộ cho bộ lọc
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();

  // Tải danh mục một lần duy nhất
  useEffect(() => {
    apiClient.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Lỗi tải danh mục:", err));
  }, []);

  // Tải sản phẩm mỗi khi bộ lọc thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Map sortBy if needed (Backend supports Sort.by)
        // Hiện tại Backend ProductController hỗ trợ keyword, categoryId, minPrice, maxPrice
        let url = `/products?page=${currentPage - 1}&size=${ITEMS_PER_PAGE}`;
        if (keyword) url += `&keyword=${keyword}`;
        if (selectedCategoryId) url += `&categoryId=${selectedCategoryId}`;
        
        const res = await apiClient.get(url);
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalItems(res.data.totalElements || 0);
      } catch (err) {
        console.error("Lỗi tải sản phẩm API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, keyword, selectedCategoryId]);

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

  const handleCategoryChange = (catId) => {
    // Nếu chọn cái đang chọn thì bỏ chọn
    const newId = selectedCategoryId == catId ? '' : catId;
    setSelectedCategoryId(newId);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategoryId('');
    setSortBy('default');
    setCurrentPage(1);
  };

  // Sắp xếp phía Client (vì Backend ProductController đơn giản chưa linh hoạt SQL Sort)
  const sortedProducts = useMemo(() => {
    let results = [...products];
    switch (sortBy) {
      case 'price-asc': return results.sort((a, b) => a.price - b.price);
      case 'price-desc': return results.sort((a, b) => b.price - a.price);
      case 'name-asc': return results.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc': return results.sort((a, b) => b.name.localeCompare(a.name));
      default: return results;
    }
  }, [products, sortBy]);

  const paginatedProducts = sortedProducts;

  const activeFilterCount = (selectedCategoryId ? 1 : 0) + (keyword ? 1 : 0);

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
        <aside className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  <i className="bi bi-funnel me-2"></i>Bộ lọc
                </h6>
                {activeFilterCount > 0 && (
                  <button className="btn btn-sm btn-outline-danger" onClick={handleClearFilters}>
                    Xoá tất cả
                  </button>
                )}
              </div>

              <div className="mb-4">
                <h6 className="fw-semibold small text-uppercase text-secondary mb-2">Danh mục</h6>
                {categories.map(cat => (
                  <div className="form-check mb-1" key={cat.id}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`cat-${cat.id}`}
                      checked={selectedCategoryId == cat.id}
                      onChange={() => handleCategoryChange(cat.id)}
                    />
                    <label className="form-check-label small" htmlFor={`cat-${cat.id}`}>
                      {cat.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="col-lg-9">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body py-3">
              <div className="row align-items-center g-2">
                <div className="col-12 col-md-5">
                  <form onSubmit={handleSearch}>
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                      <button className="btn btn-danger" type="submit">
                        <i className="bi bi-search"></i>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="col-12 col-md-3 text-muted small">
                  Hiển thị <strong>{totalItems}</strong> sản phẩm
                </div>

                <div className="col-12 col-md-4 d-flex align-items-center gap-2 justify-content-md-end">
                  <select
                    className="form-select form-select-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ maxWidth: '170px' }}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="btn-group btn-group-sm">
                    <button className={`btn ${viewMode === 'grid' ? 'btn-danger' : 'btn-outline-secondary'}`} onClick={() => setViewMode('grid')}><i className="bi bi-grid-3x3-gap-fill"></i></button>
                    <button className={`btn ${viewMode === 'list' ? 'btn-danger' : 'btn-outline-secondary'}`} onClick={() => setViewMode('list')}><i className="bi bi-list-ul"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
          ) : paginatedProducts.length === 0 ? (
            <div className="card border-0 shadow-sm py-5 text-center">
              <h5 className="text-muted">Không tìm thấy sản phẩm nào</h5>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="row">
              {paginatedProducts.map(product => (
                <div className="col-6 col-md-4 col-xl-3 mb-4" key={product.id}>
                  <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
                    <div className="card h-100 product-card border-0 shadow-sm">
                      <div className="text-center p-3 bg-light">
                        <img src={product.imageUrl || '/src/admin/assets/images/default-product.png'} alt="" className="img-fluid" style={{ height: '160px', objectFit: 'contain' }} />
                      </div>
                      <div className="card-body p-3">
                        <small className="text-muted d-block mb-1">{product.categoryName}</small>
                        <h6 className="fw-bold mb-2 text-truncate-2" style={{ height: '40px' }}>{product.name}</h6>
                        <div className="text-danger fw-bold">{formatCurrency(product.price)}</div>
                      </div>
                      <div className="card-footer bg-white border-0 p-3 pt-0">
                        <button className="btn btn-outline-danger btn-sm w-100" onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}>+ Thêm vào giỏ</button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {paginatedProducts.map(product => (
                <Link to={`/products/${product.id}`} className="card border-0 shadow-sm text-decoration-none text-dark" key={product.id}>
                  <div className="row g-0">
                    <div className="col-auto bg-light p-3 d-flex align-items-center">
                      <img src={product.imageUrl} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="" />
                    </div>
                    <div className="col card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-1">{product.name}</h6>
                        <span className="badge bg-light text-dark border">{product.brand}</span>
                      </div>
                      <div className="text-end">
                        <div className="text-danger fw-bold fs-5">{formatCurrency(product.price)}</div>
                        <button className="btn btn-sm btn-danger mt-2" onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}>Mua ngay</button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <li className={`page-item ${p === currentPage ? 'active' : ''}`} key={p}>
                    <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </main>
      </div>
    </div>
    </>
  );
}

