import React from 'react';
import { Link } from 'react-router-dom';

export default function Orders() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="">
              <h1 className="fs-3 mb-1">Quản lý đơn hàng</h1>
              <p className="mb-0">Xem và cập nhật trạng thái đơn đặt hàng</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary">
                <i className="ti ti-download"></i> Xuất dữ liệu
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div>
            <div className="d-flex gap-2 mb-3 flex-wrap justify-content-between">
              <input type="text" className="form-control" placeholder="Tìm kiếm mã đơn hàng..." style={{ maxWidth: '250px' }} />
              <div className="d-flex gap-2">
                <select className="form-select">
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipped">Đang giao</option>
                  <option value="completed">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card table-responsive">
            <table className="table mb-0 text-nowrap table-hover">
              <thead className="table-light border-light">
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <p className="mb-0 fs-5"><i className="ti ti-box-off fs-2 d-block mb-2"></i></p>
                    <p className="mb-0">Chưa có đơn hàng nào</p>
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
