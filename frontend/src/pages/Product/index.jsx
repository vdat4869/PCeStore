import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';
import { extractSpecs, collectAvailableFilters } from '../../utils/filterUtils';

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá: Tăng dần' },
  { value: 'price-desc', label: 'Giá: Giảm dần' },
  { value: 'name-asc', label: 'Tên: A-Z' },
  { value: 'name-desc', label: 'Tên: Z-A' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'bestseller', label: 'Bán chạy nhất' },
];

export default function Product() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // State cho bộ lọc
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [toast, setToast] = useState(null);
  const [expandedSections, setExpandedSections] = useState(['Danh mục', 'Mức giá', 'Thương hiệu']);
  const [selectedFilters, setSelectedFilters] = useState({}); // { 'Dung lượng': ['1TB', '2TB'], ... }
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  
  const { addToCart } = useCart();

  // Đồng bộ URL Search Params vào State khi URL thay đổi
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    setKeyword(q);
    setSelectedCategoryId(cat);
    setCurrentPage(1);
  }, [searchParams]);

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
      imageUrl: product.imageUrl,
      quantity: 1,
    });
    setToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCategoryChange = (catId) => {
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
    setSelectedFilters({});
    setPriceRange({ min: 0, max: 100000000 });
    setCurrentPage(1);
  };

  const handleFilterToggle = (filterName, value) => {
    setSelectedFilters(prev => {
        const currentSelected = prev[filterName] || [];
        const newSelected = currentSelected.includes(value)
            ? currentSelected.filter(v => v !== value)
            : [...currentSelected, value];
        
        return { ...prev, [filterName]: newSelected };
    });
    setCurrentPage(1);
  };

  // Thu thập các giá trị filter khả dụng từ dữ liệu hiện tại
  const availableFilters = useMemo(() => {
    const catName = categories.find(c => c.id == selectedCategoryId)?.name || keyword || "";
    return collectAvailableFilters(products, catName);
  }, [products, categories, selectedCategoryId, keyword]);

  const currentCategoryName = categories.find(c => c.id == selectedCategoryId)?.name || keyword || "";

  // Sắp xếp & Lọc phía Client
  const filteredAndSortedProducts = useMemo(() => {
    let results = [...products];

    // 1. Áp dụng Advanced Filters (Specs)
    Object.keys(selectedFilters).forEach(filterKey => {
        const activeValues = selectedFilters[filterKey];
        if (activeValues && activeValues.length > 0) {
            results = results.filter(p => {
                const specs = extractSpecs(p.name, currentCategoryName);
                return activeValues.includes(specs[filterKey]);
            });
        }
    });

    // 2. Lọc theo Mức giá
    results = results.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // 3. Sắp xếp
    switch (sortBy) {
      case 'price-asc': return results.sort((a, b) => a.price - b.price);
      case 'price-desc': return results.sort((a, b) => b.price - a.price);
      case 'name-asc': return results.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc': return results.sort((a, b) => b.name.localeCompare(a.name));
      default: return results;
    }
  }, [products, sortBy, selectedFilters, currentCategoryName]);

  const paginatedProducts = filteredAndSortedProducts;

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  return (
    <>
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

      {/* Custom styles for the dual-range slider */}
      <style>{`
        input[type=range].price-slider {
          pointer-events: none;
          height: 0;
        }
        input[type=range].price-slider::-webkit-slider-thumb {
          pointer-events: all;
          cursor: pointer;
        }
        input[type=range].price-slider::-moz-range-thumb {
          pointer-events: all;
          cursor: pointer;
        }
      `}</style>

      <div className="container pb-5">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Sản phẩm</li>
          </ol>
        </nav>

        <div className="row">
          <aside className="col-lg-3 mb-4">
            <div className="card shadow-sm border-0 mb-3">
               <div className="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0">Mức giá</h6>
               </div>
               <div className="card-body pt-0">
                  <div className="d-flex align-items-center gap-2 mb-3 mt-3">
                     <div className="flex-fill bg-light p-2 rounded text-center small border">
                       {formatCurrency(priceRange.min)}
                     </div>
                     <span>-</span>
                     <div className="flex-fill bg-light p-2 rounded text-center small border">
                       {formatCurrency(priceRange.max)}
                     </div>
                  </div>
                  
                  <div className="position-relative w-100" style={{ height: '20px' }}>
                     <input 
                       type="range" 
                       min="0" 
                       max="100000000" 
                       step="500000"
                       value={priceRange.min} 
                       onChange={(e) => {
                          const val = Math.min(Number(e.target.value), priceRange.max - 1000000);
                          setPriceRange(p => ({ ...p, min: val }));
                          setCurrentPage(1);
                       }}
                       className="w-100 position-absolute price-slider"
                       style={{ zIndex: 3, accentColor: '#e30019', top: 0, appearance: 'none', background: 'transparent', pointerEvents: 'auto' }}
                     />
                     <input 
                       type="range" 
                       min="0" 
                       max="100000000" 
                       step="500000"
                       value={priceRange.max} 
                       onChange={(e) => {
                          const val = Math.max(Number(e.target.value), priceRange.min + 1000000);
                          setPriceRange(p => ({ ...p, max: val }));
                          setCurrentPage(1);
                       }}
                       className="w-100 position-absolute price-slider"
                       style={{ zIndex: 4, accentColor: '#e30019', top: 0, appearance: 'none', background: 'transparent', pointerEvents: 'auto' }}
                     />
                     <div 
                       className="position-absolute w-100 rounded-pill" 
                       style={{ height: 4, background: '#eee', top: 8, zIndex: 1 }}
                     ></div>
                     <div 
                       className="position-absolute rounded-pill" 
                       style={{ 
                         height: 4, 
                         background: '#e30019', 
                         top: 8, 
                         zIndex: 2,
                         left: `${(priceRange.min / 100000000) * 100}%`,
                         right: `${100 - (priceRange.max / 100000000) * 100}%`
                       }}
                     ></div>
                  </div>
               </div>
            </div>

            <div className="card shadow-sm border-0">
               <div className="card-body p-0">
                 {!(selectedCategoryId || keyword) && (
                   <div className="border-bottom">
                      <div 
                        className="d-flex justify-content-between align-items-center p-3 cursor-pointer fw-bold"
                        onClick={() => toggleSection('Danh mục')}
                      >
                         Danh mục
                         <i className={`bi bi-caret-${expandedSections.includes('Danh mục') ? 'up' : 'down'}-fill small`}></i>
                      </div>
                      {expandedSections.includes('Danh mục') && (
                        <div className="px-3 pb-3">
                          {categories.map(cat => (
                            <div className="form-check mb-2" key={cat.id}>
                              <input className="form-check-input" type="checkbox" id={`cat-${cat.id}`} checked={selectedCategoryId == cat.id} onChange={() => handleCategoryChange(cat.id)} />
                              <label className="form-check-label small" htmlFor={`cat-${cat.id}`}>{cat.name}</label>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                 )}

               {Object.keys(availableFilters).map(filterName => (
                 <div className="border-bottom" key={filterName}>
                    <div 
                      className="d-flex justify-content-between align-items-center p-3 cursor-pointer fw-bold"
                      onClick={() => toggleSection(filterName)}
                    >
                       {filterName}
                       <i className={`bi bi-caret-${expandedSections.includes(filterName) ? 'up' : 'down'}-fill small`}></i>
                    </div>
                    {expandedSections.includes(filterName) && (
                      <div className="px-3 pb-3">
                        {availableFilters[filterName].map(val => (
                            <div className="form-check mb-2" key={val}>
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id={`filter-${filterName}-${val}`}
                                    checked={(selectedFilters[filterName] || []).includes(val)}
                                    onChange={() => handleFilterToggle(filterName, val)}
                                />
                                <label className="form-check-label small" htmlFor={`filter-${filterName}-${val}`}>
                                    {val}
                                </label>
                            </div>
                        ))}
                      </div>
                    )}
                 </div>
               ))}
               </div>
            </div>
          </aside>

          <main className="col-lg-9">
            <div className="mb-4">
               <div className="d-flex align-items-center mb-3">
                  <h3 className="fw-bold mb-0 me-3">
                     {categories.find(c => c.id == selectedCategoryId)?.name || 'Sản phẩm nổi bật'}
                     <span className="text-muted fs-6 fw-normal ms-2">({totalItems} sản phẩm)</span>
                  </h3>
               </div>
               
               <div className="d-flex align-items-center bg-white p-2 rounded shadow-sm gap-2 flex-wrap">
                  <strong className="me-2 text-dark">Sắp xếp theo:</strong>
                  {SORT_OPTIONS.map(opt => (
                     <button 
                        key={opt.value}
                        className={`btn btn-sm ${sortBy === opt.value ? 'btn-danger bg-danger text-white border-danger' : 'btn-outline-secondary bg-white text-dark border-light shadow-sm'}`}
                        style={{ fontSize: '13px' }}
                        onClick={() => setSortBy(opt.value)}
                     >
                       {opt.label}
                     </button>
                  ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
            ) : paginatedProducts.length === 0 ? (
              <div className="card border-0 shadow-sm py-5 text-center">
                <h5 className="text-muted">Không tìm thấy sản phẩm nào</h5>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="row g-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5">
                {paginatedProducts.map(product => (
                   <div className="col mb-3" key={product.id}>
                     <Link to={`/products/${product.id}`} className="text-decoration-none text-dark h-100 d-block">
                       <div className="card h-100 product-card border shadow-sm position-relative overflow-hidden transition-all hover-shadow" style={{ borderRadius: 6 }}>
                         <span className="position-absolute badge bg-danger" style={{ top: 10, right: 10, zIndex: 2 }}>HOT</span>
                         <div className="text-center p-3 bg-white position-relative">
                           <img src={product.imageUrl || '/default-product.png'} alt="" className="img-fluid" style={{ height: '160px', objectFit: 'contain' }} />
                         </div>
                         <div className="card-body p-3 d-flex flex-column" style={{ minHeight: '150px' }}>
                            <h6 className="fw-bold mb-2 text-truncate-2" style={{ fontSize: '13.5px', lineHeight: '1.5', color: '#333', minHeight: '42px', overflow: 'hidden' }}>
                                {product.name}
                            </h6>
                            <div className="mt-auto">
                               <div className="text-danger fw-bold fs-5 mb-1">{formatCurrency(product.price)}</div>
                               <div className="d-flex flex-wrap gap-1">
                                  <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: '11px', padding: '4px 8px' }}>
                                     <i className="bi bi-cpu me-1"></i>{product.brand}
                                  </span>
                               </div>
                            </div>
                         </div>
                         <div className="card-footer bg-white border-top-0 p-3 pt-0">
                            <button className="btn btn-outline-danger fw-bold btn-sm w-100 py-2 hover-bg-danger transition-all shadow-sm" style={{ fontSize: '13px' }} onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}>Mua ngay</button>
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
