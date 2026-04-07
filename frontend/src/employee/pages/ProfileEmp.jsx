import React, { useState, useEffect } from 'react';

export default function ProfileEmp() {
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch('http://localhost:8080/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => data && setProfile(data))
    .catch(err => console.error(err));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const res = await fetch('http://localhost:8080/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(profile)
    });
    if (res.ok) alert('Cập nhật hồ sơ thành công!');
  };

  const handleChangePassword = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:8080/api/users/change-password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ oldPassword, newPassword })
      });
      if (res.ok) {
          alert('Đổi mật khẩu thành công!');
          setOldPassword('');
          setNewPassword('');
      } else {
          alert('Mật khẩu cũ không chính xác!');
      }
  };

  return (
    <div className="container-fluid">
       <div className="mb-4">
          <h1 className="fs-3">Hồ sơ cá nhân</h1>
          <p className="text-secondary text-sm">Cập nhật thông tin định danh nhân viên</p>
       </div>

       <div className="row g-4">
          <div className="col-12 col-md-6">
             <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center">
                   <h5 className="mb-0 fs-6">Thông tin tài khoản</h5>
                </div>
                <div className="card-body p-4">
                   <form onSubmit={handleUpdate}>
                      <div className="mb-3">
                         <label className="form-label small text-muted">Email (Tài khoản được cấp)</label>
                         <input type="text" className="form-control bg-light" value={profile.email} disabled />
                      </div>
                      <div className="mb-3">
                         <label className="form-label small">Họ và tên</label>
                         <input type="text" className="form-control" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
                      </div>
                      <div className="mb-4">
                         <label className="form-label small">Số điện thoại</label>
                         <input type="text" className="form-control" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                      </div>
                      <button type="submit" className="btn btn-primary px-4 fw-bold shadow-none">Lưu thay đổi</button>
                   </form>
                </div>
             </div>
          </div>

          <div className="col-12 col-md-6">
             <div className="card shadow-sm border-0 border-start border-4 border-warning">
                <div className="card-header bg-white py-3 border-bottom">
                   <h5 className="mb-0 fs-6">Bảo mật & Mật khẩu</h5>
                </div>
                <div className="card-body p-4">
                   <form onSubmit={handleChangePassword}>
                      <div className="mb-3">
                         <label className="form-label small">Mật khẩu cũ</label>
                         <input type="password" placeholder="Nhập mật khẩu cũ" className="form-control" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                      </div>
                      <div className="mb-4">
                         <label className="form-label small">Mật khẩu mới</label>
                         <input type="password" placeholder="Mật khẩu cực mạnh" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                      </div>
                      <button type="submit" className="btn btn-warning px-4 fw-bold shadow-none">Đổi mật khẩu</button>
                   </form>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
