import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products?keyword=${keyword}&size=50`);
      setProducts(res.data.content || []);
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await apiClient.delete(`/products/${id}`);
      alert("Đã xóa sản phẩm thành công!");
      fetchProducts();
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchProducts();
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="">
              <h1 className="fs-3 mb-1">Quản lý Sản phẩm & Kho</h1>
              <p className="mb-0">Xem danh sách, chỉnh sửa và theo dõi tồn kho</p>
            </div>
            <div>
              <Link to="/admin/create-product" className="btn btn-primary">
                <i className="bi bi-plus-lg me-1"></i> Thêm sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div>
            <div className="d-flex gap-2 mb-3 flex-wrap justify-content-between">
              <div className="input-group" style={{ maxWidth: '350px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Tìm theo tên sản phẩm..." 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={handleSearch}
                />
                <button className="btn btn-outline-secondary" onClick={fetchProducts}>
                  <i className="bi bi-search"></i>
                </button>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={fetchProducts}>
                  <i className="bi bi-arrow-clockwise"></i> Làm mới
                </button>
              </div>
            </div>
          </div>
          <div className="card table-responsive border-0 shadow-sm">
            <table className="table mb-0 text-nowrap table-hover align-middle">
              <thead className="table-light border-light">
                <tr>
                  <th>Hình ảnh</th>
                  <th>ID</th>
                  <th>Tên sản phẩm</th>
                  <th>Thương hiệu</th>
                  <th>Giá gốc</th>
                  <th>Tồn kho</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">Không tìm thấy sản phẩm nào</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <img 
                          src={p.imageUrl || "/src/admin/assets/images/default-product.png"} 
                          alt="" 
                          className="avatar avatar-md rounded object-fit-cover" 
                          style={{ width: '45px', height: '45px' }}
                        />
                      </td>
                      <td><span className="text-muted fw-bold">#{p.id}</span></td>
                      <td>
                        <div className="fw-bold text-dark">{p.name}</div>
                        <small className="text-muted">{p.categoryName}</small>
                      </td>
                      <td>{p.brand}</td>
                      <td><span className="text-danger fw-bold">{p.price?.toLocaleString()}đ</span></td>
                      <td>
                        <span className={`fw-bold ${p.stock <= 5 ? 'text-danger' : 'text-dark'}`}>
                          {p.stock !== null ? p.stock : 0}
                        </span>
                        {p.stock === 0 && <span className="ms-1 badge bg-secondary small">Hết hàng</span>}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/admin/edit-product/${p.id}`} className="btn btn-sm btn-light border" title="Chỉnh sửa">
                            <i className="bi bi-pencil-square text-primary"></i>
                          </Link>
                          <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-light border" title="Xoá">
                            <i className="bi bi-trash text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

