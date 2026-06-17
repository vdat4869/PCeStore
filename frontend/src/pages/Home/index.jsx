import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';
import StoreProductCard from '../../components/StoreProductCard';

const promoSlides = [
  { image: '/promo-slide-2.png', alt: 'Nang doi laptop PCeStore' },
  { image: '/promo-slide-1.png', alt: 'Lenovo Legion RTX 50 PCeStore' },
  { image: '/promo-slide-3.png', alt: 'Kho laptop duoi 9 trieu PCeStore' },
  { image: '/promo-slide-4.png', alt: 'Tuan le laptop gaming PCeStore' },
];

const getCategoryIcon = (name = '') => {
  const value = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (value.includes('laptop') && value.includes('gaming')) return 'bi-laptop';
  if (value.includes('laptop')) return 'bi-laptop';
  if (value.includes('cpu')) return 'bi-cpu';
  if (value.includes('main')) return 'bi-motherboard';
  if (value.includes('ram')) return 'bi-memory';
  if (value.includes('vga') || value.includes('gpu')) return 'bi-gpu-card';
  if (value.includes('ssd')) return 'bi-device-ssd';
  if (value.includes('hdd')) return 'bi-device-hdd';
  if (value.includes('nguon') || value.includes('psu')) return 'bi-lightning-charge';
  if (value.includes('case')) return 'bi-pc-display-horizontal';
  if (value.includes('tan nhiet') || value.includes('cooler')) return 'bi-fan';
  if (value.includes('gear')) return 'bi-keyboard';
  if (value.includes('man hinh') || value.includes('monitor')) return 'bi-display';

  return 'bi-grid-3x3-gap';
};

export default function Home() {
  const [activeTab, setActiveTab] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tabProducts, setTabProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const initHome = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/products?size=5'),
        ]);

        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          setActiveTab(catRes.data[0].id);
        }
        setFlashSaleProducts(prodRes.data.content || []);
      } catch (err) {
        console.error('Loi khoi tao Home:', err);
      } finally {
        setLoading(false);
      }
    };
    initHome();
  }, []);

  useEffect(() => {
    if (!activeTab) return;

    apiClient.get(`/products?categoryId=${activeTab}&size=10`)
      .then(res => setTabProducts(res.data.content || []))
      .catch(err => console.error('Loi tai san pham theo danh muc:', err));
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex(current => (current + 1) % promoSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (p) => {
    addToCart({
      productId: p.id,
      productName: p.name,
      price: p.price,
      image: p.imageUrl,
      imageUrl: p.imageUrl,
      quantity: 1,
    });
    setToast(`Da them "${p.name}" vao gio hang!`);
    setTimeout(() => setToast(null), 2500);
  };

  const showPrevPromo = () => {
    setPromoIndex(current => (current - 1 + promoSlides.length) % promoSlides.length);
  };

  const showNextPromo = () => {
    setPromoIndex(current => (current + 1) % promoSlides.length);
  };

  const visiblePromoSlides = [
    promoSlides[promoIndex],
    promoSlides[(promoIndex + 1) % promoSlides.length],
  ];

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border store-spinner"></div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className="store-toast">
          <i className="bi bi-cart-check me-2"></i>{toast}
        </div>
      )}

      <div className="container pb-5 store-home">
        <section className="store-hero store-hero--image mb-4">
          <div className="store-hero__main">
            <div className="store-hero__actions">
              <Link to="/products" className="btn store-btn-primary">
                Mua ngay <i className="bi bi-arrow-right ms-1"></i>
              </Link>
              <Link to="/build-pc" className="btn store-btn-ghost">
                Build PC
              </Link>
            </div>
          </div>
        </section>

        <section className="store-promo-carousel mb-4" aria-label="Khuyen mai noi bat">
          <button
            type="button"
            className="store-promo-carousel__arrow store-promo-carousel__arrow--prev"
            onClick={showPrevPromo}
            aria-label="Khuyen mai truoc"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className="store-promo-carousel__viewport">
            <div className="store-promo-carousel__grid">
              {visiblePromoSlides.map((slide, index) => (
                <Link
                  to="/products"
                  className="store-promo-slide"
                  key={`${slide.image}-${index}`}
                  aria-label={slide.alt}
                >
                  <img src={slide.image} alt={slide.alt} />
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="store-promo-carousel__arrow store-promo-carousel__arrow--next"
            onClick={showNextPromo}
            aria-label="Khuyen mai tiep theo"
          >
            <i className="bi bi-chevron-right"></i>
          </button>

        </section>

        <section className="store-policy-row mb-3">
          {[
            ['bi-patch-check', 'Hang chinh hang', 'Bao hanh ro rang'],
            ['bi-truck', 'Giao hang nhanh', 'Ho tro toan quoc'],
            ['bi-credit-card', 'Tra gop linh hoat', 'Nhieu phuong thuc'],
            ['bi-headset', 'Tu van 24/7', 'Ho tro cau hinh'],
          ].map(([icon, title, desc]) => (
            <div className="store-policy" key={title}>
              <i className={`bi ${icon}`}></i>
              <div>
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="store-service-strip mb-4">
          <i className="bi bi-tools"></i>
          <div>
            <span className="store-eyebrow">Dich vu</span>
            <strong>Tu van cau hinh nhanh</strong>
            <p>Chon dung linh kien, giam rui ro mua sai, xem gio hang va thanh toan trong mot luong.</p>
          </div>
          <Link to="/order-tracking" className="store-link-strong">Tra cuu don hang</Link>
        </section>

        <section className="store-section mb-4">
          <div className="store-section__header">
            <h2>DANH MUC NOI BAT</h2>
            <Link to="/products" className="store-link-strong">Xem tat ca</Link>
          </div>
          <div className="store-category-grid">
            {categories.slice(0, 10).map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className={`store-category-tile ${activeTab === cat.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(cat.id)}
              >
                <i className={`bi ${getCategoryIcon(cat.name)}`}></i>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="store-tabs d-flex justify-content-between align-items-center mb-3 overflow-auto">
          <ul className="nav nav-pills flex-nowrap">
            {categories.slice(0, 10).map(cat => (
              <li className="nav-item" key={cat.id}>
                <button
                  className={`nav-link fw-bold me-2 text-nowrap ${activeTab === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
          <Link to="/products" className="store-link-strong small text-nowrap ms-3">
            Xem tat ca <i className="bi bi-chevron-right"></i>
          </Link>
        </div>

        <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-5">
          {tabProducts.map((p) => (
            <div className="col" key={p.id}>
              <StoreProductCard product={p} onAddToCart={handleAddToCart} sectionLabel="Noi bat" />
            </div>
          ))}
          {tabProducts.length === 0 && (
            <div className="text-center p-4 text-muted w-100">Chua co san pham trong danh muc nay.</div>
          )}
        </div>

        <div className="store-section__header mt-5 mb-3">
          <div>
            <span className="store-eyebrow">Sale cuoi ngay</span>
            <h2>San pham moi nhat</h2>
          </div>
          <Link to="/products" className="store-link-strong">Xem them</Link>
        </div>
        <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-5">
          {flashSaleProducts.map((p) => (
            <div className="col" key={p.id}>
              <StoreProductCard product={p} onAddToCart={handleAddToCart} sectionLabel="Moi ve" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
