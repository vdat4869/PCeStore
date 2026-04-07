import React, { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8080/api/admin/users?size=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/role?role=${newRole}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Cập nhật quyền thành công!');
        fetchUsers();
      } else {
        alert('Có lỗi xảy ra khi phân quyền!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleHardDelete = async (userId) => {
    if (!window.confirm("CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn dữ liệu của người dùng này khỏi cơ sở dữ liệu. Bạn có chắc chắn muốn xóa?")) {
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/hard`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Đã xóa vĩnh viễn tài khoản!');
        fetchUsers();
      } else {
        alert('Lỗi: Bạn không thể xóa tài khoản này!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="">
              <h1 className="fs-3 mb-1">Quản lý người dùng</h1>
              <p className="mb-0">Thiết lập vai trò và quản lý tài khoản email khách hàng</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card table-responsive">
            <table className="table mb-0 text-nowrap table-hover">
              <thead className="table-light border-light">
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Phân quyền (Role)</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center">Đang tải...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">Trống</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>{u.fullName || 'Chưa cập nhật'}</td>
                      <td>{u.email}</td>
                      <td>
                        <select 
                          className="form-select form-select-sm" 
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="CUSTOMER">Khách hàng (User)</option>
                          <option value="EMPLOYEE">Nhân viên (Employee)</option>
                          <option value="ADMIN">Quản trị (Admin)</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleHardDelete(u.id)}
                          className="btn btn-sm btn-outline-danger"
                          title="Xóa vĩnh viễn"
                        >
                           Xóa
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
  );
}
