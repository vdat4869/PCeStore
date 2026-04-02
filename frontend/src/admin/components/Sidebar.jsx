import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ isCollapsed, isMobileShow }) {
  const location = useLocation();

  const getNavLinkClass = (path) => {
    return `nav-link ${location.pathname === path ? 'active' : ''}`;
  };

  return (
    <aside id="sidebar" className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileShow ? 'mobile-show' : ''}`}>
      <div className="logo-area">
        <Link to="/admin" className="d-inline-flex">
          <img src="/src/admin/assets/images/logo-estore.png" alt="PC eStore Logo" style={{ height: '36px', objectFit: 'contain' }} />
        </Link>
      </div>
      <ul className="nav flex-column">
        <li className="px-4 py-2"><small className="nav-text">Main</small></li>
        <li>
          <Link className={getNavLinkClass('/admin')} to="/admin">
            <i className="ti ti-home"></i><span className="nav-text">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/inventory')} to="/admin/inventory">
            <i className="ti ti-box-seam"></i><span className="nav-text">Inventory</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/create-product')} to="/admin/create-product">
            <i className="ti ti-plus"></i><span className="nav-text">Add Product</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/reports')} to="/admin/reports">
            <i className="ti ti-receipt"></i><span className="nav-text">Reports</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/docs')} to="/admin/docs">
            <i className="ti ti-file-text"></i><span className="nav-text">Docs</span>
          </Link>
        </li>

        <li className="px-4 pt-4 pb-2"><small className="nav-text">Account</small></li>
        <li>
          <Link className={getNavLinkClass('/admin/signin')} to="/admin/signin">
            <i className="ti ti-logout"></i><span className="nav-text">Log in</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/signup')} to="/admin/signup">
            <i className="ti ti-user-plus"></i><span className="nav-text">Sign up</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
