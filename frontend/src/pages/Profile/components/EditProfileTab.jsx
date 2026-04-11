import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function EditProfileTab() {
  const { updateUserInfo } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', phone: '' });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/users/profile')
      .then(res => setFormData({ 
        fullName: res.data.fullName || res.data.name || '', 
        phone: res.data.phone || '' 
      }))
      .catch(console.error);
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone && formData.phone.trim() !== '' ? formData.phone : null
      };
      await apiClient.put('/users/profile', payload);
      updateUserInfo({ fullName: formData.fullName, phone: formData.phone });
      
      // Handle avatar upload separately
      if (avatar) {
        const uploadForm = new FormData();
        uploadForm.append('file', avatar);
        const avatarRes = await apiClient.post('/users/profile/avatar', uploadForm, {
           headers: { 'Content-Type': 'multipart/form-data' }
        });
        // Backend returns the path like "/uploads/avatars/filename.jpg"
        updateUserInfo({ avatarUrl: avatarRes.data });
      }
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4"><i className="bi bi-person-lines-fill text-danger me-2"></i>Chỉnh sửa Hồ sơ</h5>
        
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        
        <form onSubmit={handleUpdate}>
          <div className="mb-3">
            <label className="form-label text-muted small">Họ và tên</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.fullName} 
              onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted small">Số điện thoại</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            />
          </div>
          <div className="mb-4">
            <label className="form-label text-muted small">Ảnh đại diện (Avatar)</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*"
              onChange={e => setAvatar(e.target.files[0])} 
            />
          </div>
          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
