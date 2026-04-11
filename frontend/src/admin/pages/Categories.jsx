import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await apiClient.post('/categories', { name: newCatName });
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      alert("Lỗi khi thêm danh mục");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCat.name.trim()) return;
    try {
      await apiClient.put(`/categories/${editingCat.id}`, { name: editingCat.name });
      setEditingCat(null);
      fetchCategories();
    } catch (err) {
      alert("Lỗi khi cập nhật");
    }
  };

  const handleDelete = async (id) => {
     if (!window.confirm("Xóa danh mục này có thể ảnh hưởng đến hiển thị sản phẩm. Bạn chắc chứ?")) return;
     try {
        await apiClient.delete(`/categories/${id}`);
        fetchCategories();
     } catch (err) {
        alert("Lỗi khi xóa");
     }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Quản lý Danh mục</h1>
          <p className="text-secondary">Phân loại sản phẩm giúp khách hàng dễ dàng tìm kiếm</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
           <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">{editingCat ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h5>
              <form onSubmit={editingCat ? handleUpdate : handleAdd}>
                 <div className="mb-3">
                    <label className="form-label small fw-bold">Tên danh mục</label>
                    <input 
                       type="text" 
                       className="form-control" 
                       placeholder="Ví dụ: Laptop, RAM, VGA..." 
                       value={editingCat ? editingCat.name : newCatName}
                       onChange={e => editingCat ? setEditingCat({...editingCat, name: e.target.value}) : setNewCatName(e.target.value)}
                    />
                 </div>
                 <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary w-100 fw-bold">
                       {editingCat ? 'Lưu thay đổi' : 'Thêm mới'}
                    </button>
                    {editingCat && (
                       <button type="button" className="btn btn-light" onClick={() => setEditingCat(null)}>Hủy</button>
                    )}
                 </div>
              </form>
           </div>
        </div>

        <div className="col-md-8">
           <div className="card border-0 shadow-sm overflow-hidden">
              <div className="table-responsive">
                 <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                       <tr>
                          <th className="px-4 py-3" style={{ width: '80px' }}>ID</th>
                          <th className="py-3">Tên danh mục</th>
                          <th className="py-3 text-center px-4">Thao tác</th>
                       </tr>
                    </thead>
                    <tbody>
                       {loading ? (
                          <tr><td colSpan="3" className="text-center py-5">Đang tải...</td></tr>
                       ) : categories.length === 0 ? (
                          <tr><td colSpan="3" className="text-center py-5 text-muted">Chưa có danh mục nào</td></tr>
                       ) : (
                          categories.map(cat => (
                             <tr key={cat.id}>
                                <td className="px-4 text-muted fw-bold">#{cat.id}</td>
                                <td className="fw-bold text-dark">{cat.name}</td>
                                <td className="text-center px-4">
                                   <button 
                                      className="btn btn-sm btn-light border me-2" 
                                      onClick={() => setEditingCat(cat)}
                                   >
                                      <i className="bi bi-pencil-square text-primary"></i>
                                   </button>
                                   <button 
                                      className="btn btn-sm btn-light border"
                                      onClick={() => handleDelete(cat.id)}
                                   >
                                      <i className="bi bi-trash text-danger"></i>
                                   </button>
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
    </div>
  );
}
