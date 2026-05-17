import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils';

export default function Topbar({ toggleSidebar, toggleMobileSidebar, isSidebarCollapsed }) {
  const { user } = useAuth();
  
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  return (
    <nav id="topbar" className={`navbar bg-white border-bottom fixed-top topbar px-3 ${isSidebarCollapsed ? 'full' : ''}`}>
      <button 
        id="toggleBtn" 
        className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm"
        onClick={toggleSidebar}
      >
        <i className="ti ti-layout-sidebar-left-expand"></i>
      </button>

      {/* MOBILE */}
      <button 
        id="mobileBtn" 
        className="btn btn-light btn-icon btn-sm d-lg-none me-2"
        onClick={toggleMobileSidebar}
      >
        <i className="ti ti-layout-sidebar-left-expand"></i>
      </button>
      
      <div>
        {/* Navbar nav */}
        <ul className="list-unstyled d-flex align-items-center mb-0 gap-1">
          {/* Theme Toggle Icon */}
          <li>
            <button 
              className="position-relative btn-icon btn-sm btn-light btn rounded-circle border-0" 
              onClick={toggleTheme}
              title={theme === 'light' ? 'Chuyển sang Giao diện Tối' : 'Chuyển sang Giao diện Sáng'}
            >
              <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'} fs-5`}></i>
            </button>
          </li>

          {/* Avatar Profile Link */}
          <li className="ms-3">
            <Link to="/admin/profile" title="Chỉnh sửa hồ sơ cá nhân">
              <img src={formatImageUrl(user?.avatarUrl) || "/avatar/avatar-1.jpg"} alt="User Avatar" className="avatar avatar-sm rounded-circle shadow-sm" style={{ border: '2px solid #fff' }} />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
