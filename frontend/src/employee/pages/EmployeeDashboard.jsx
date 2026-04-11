import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    lowStockItems: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Lấy toàn bộ đơn hàng để lọc "PENDING" hoặc "PAID"
        const ordersRes = await apiClient.get('/v1/orders/admin/all');
        const pending = ordersRes.data.filter(o => o.status === 'PAID' || o.status === 'PENDING').length;
        
        // Lấy sản phẩm để lọc "Sắp hết hàng"
        const productsRes = await apiClient.get('/products?size=100');
        const lowStock = productsRes.data.content.filter(p => p.stock <= 5).length;

        setStats({
          pendingOrders: pending,
          lowStockItems: lowStock,
          recentOrders: ordersRes.data.slice(0, 5)
        });
      } catch (err) {
        console.error("Lỗi tải dashboard nhân viên:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Bảng làm việc Nhân viên</h1>
          <p className="text-secondary">Chào mừng trở lại! Dưới đây là các tác vụ cần bạn xử lý.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100 bg-primary bg-opacity-10">
             <div className="d-flex align-items-center">
                <div className="bg-primary text-white p-3 rounded-circle me-3">
                   <i className="bi bi-cart-check fs-4"></i>
                </div>
                <div>
                   <h2 className="fw-bold mb-0">{stats.pendingOrders}</h2>
                   <div className="text-primary fw-medium">Đơn hàng mới chờ duyệt</div>
                </div>
             </div>
             <Link to="/employee/orders" className="btn btn-primary mt-3 w-100 fw-bold">Xử lý ngay</Link>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100 bg-danger bg-opacity-10">
             <div className="d-flex align-items-center">
                <div className="bg-danger text-white p-3 rounded-circle me-3">
                   <i className="bi bi-exclamation-octagon fs-4"></i>
                </div>
                <div>
                   <h2 className="fw-bold mb-0">{stats.lowStockItems}</h2>
                   <div className="text-danger fw-medium">Sản phẩm sắp hết hàng</div>
                </div>
             </div>
             <Link to="/employee/inventory" className="btn btn-danger mt-3 w-100 fw-bold">Kiểm tra kho</Link>
          </div>
        </div>
      </div>

      <div className="row">
         <div className="col-12">
            <div className="card border-0 shadow-sm p-0">
               <div className="card-header bg-white border-bottom py-3">
                  <h6 className="mb-0 fw-bold">Đơn hàng vừa nhận</h6>
               </div>
               <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                     <tbody>
                        {stats.recentOrders.map(o => (
                           <tr key={o.id}>
                              <td className="px-4 fw-bold">#{o.id}</td>
                              <td>{o.totalAmount?.toLocaleString()}đ</td>
                              <td>
                                 <span className="badge bg-light text-dark">{o.status}</span>
                              </td>
                              <td className="text-end px-4">
                                 <Link to="/employee/orders" className="btn btn-sm btn-light border">Chi tiết</Link>
                              </td>
                           </tr>
                        ))}
                        {stats.recentOrders.length === 0 && (
                           <tr><td colSpan="4" className="text-center py-4">Hôm nay chưa có đơn hàng nào mới</td></tr>
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
