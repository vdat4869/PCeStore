import React, { useState } from 'react';

export default function Complaints() {
  const [complaints, setComplaints] = useState([
    { id: 1, customer: "Nguyễn Văn An", issue: "Lỗi VGA bị crash", status: "PENDING", date: "2026-04-05" },
    { id: 2, customer: "Trần Thị Bé", issue: "Giao hàng chậm 2 ngày", status: "PROCESSING", date: "2026-04-06" }
  ]);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="fs-3 mb-1">Xử lý khiếu nại</h1>
        <p className="text-secondary">Hỗ trợ khách hàng và giải quyết các vấn đề phát sinh</p>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
             <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fs-6">Danh sách khiếu nại mới</h5>
                <div className="d-flex gap-2">
                   <select className="form-select form-select-sm">
                      <option value="">Tất cả trạng thái</option>
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="PROCESSING">Đang xử lý</option>
                      <option value="RESOLVED">Đã giải quyết</option>
                   </select>
                </div>
             </div>
             <div className="card-body p-0">
                <div className="table-responsive text-nowrap">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Vấn đề</th>
                        <th>Ngày yêu cầu</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map(c => (
                        <tr key={c.id}>
                          <td>#{c.id}</td>
                          <td>{c.customer}</td>
                          <td>{c.issue}</td>
                          <td>{c.date}</td>
                          <td>
                            <span className={`badge ${c.status === 'PENDING' ? 'bg-danger' : 'bg-warning'}`}>
                               {c.status}
                            </span>
                          </td>
                          <td>
                             <button className="btn btn-sm btn-primary">Xử lý ngay</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
