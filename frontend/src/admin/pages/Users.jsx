import React from 'react';
import { Link } from 'react-router-dom';

export default function Users() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="">
              <h1 className="fs-3 mb-1">Quản lý người dùng</h1>
              <p className="mb-0">Danh sách tài khoản khách hàng, nhân viên và quản trị viên</p>
            </div>
            <div>
              <button className="btn btn-primary"><i className="ti ti-user-plus"></i> Thêm người dùng</button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div>
            <div className="d-flex gap-2 mb-3 flex-wrap justify-content-between">
              <input type="text" className="form-control" placeholder="Tìm kiếm người dùng (email, tên)..." style={{ maxWidth: '350px' }} />
              <div className="d-flex gap-2">
                <select className="form-select">
                  <option value="">Tất cả vai trò</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card table-responsive">
            <table className="table mb-0 text-nowrap table-hover">
              <thead className="table-light border-light">
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tham gia</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <p className="mb-0 fs-5"><i className="ti ti-users fs-2 d-block mb-2"></i></p>
                    <p className="mb-0">Chưa có người dùng nào</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
