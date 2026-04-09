import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function EmployeeTopbar({ toggleSidebar, toggleMobileSidebar, isSidebarCollapsed }) {
  const [userName, setUserName] = useState('Employee');

  useEffect(() => {
    const token = localStorage.getItem('adminToken'); // Employee uses same token slot
    if (token) {
      fetch('http://localhost:8080/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.fullName) setUserName(data.fullName);
      })
      .catch(err => console.error(err));
    }
  }, []);

  return (
    <nav id="topbar" className={`navbar bg-white border-bottom fixed-top topbar px-3 ${isSidebarCollapsed ? 'full' : ''}`}>
      <div className="d-flex align-items-center">
        <button 
          id="toggleBtn" 
          className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm me-3"
          onClick={toggleSidebar}
        >
          <i className="ti ti-layout-sidebar-left-expand"></i>
        </button>

        <button 
          id="mobileBtn" 
          className="btn btn-light btn-icon btn-sm d-lg-none me-2"
          onClick={toggleMobileSidebar}
        >
          <i className="ti ti-layout-sidebar-left-expand"></i>
        </button>
        <span className="fw-bold d-none d-md-inline-block">Cổng thông tin Nhân viên</span>
      </div>
      
      <div className="ms-auto d-flex align-items-center gap-3">
        <div className="text-end d-none d-sm-block">
          <p className="mb-0 small fw-bold">{userName}</p>
          <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>Vận hành đơn hàng</p>
        </div>
        <div className="dropdown">
           <a href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="/src/admin/assets/images/avatar/avatar-1.jpg" alt="" className="avatar avatar-sm rounded-circle" />
           </a>
           <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="/profile">Thông tin cá nhân</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item text-danger" to="/login">Đăng xuất</Link></li>
           </ul>
        </div>
      </div>
    </nav>
  );
}
