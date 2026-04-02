import React from 'react';

export default function Topbar({ toggleSidebar, toggleMobileSidebar, isSidebarCollapsed }) {
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
          {/* Bell icon */}
          <li>
            <a className="position-relative btn-icon btn-sm btn-light btn rounded-circle" data-bs-toggle="dropdown" aria-expanded="false" href="#" role="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-bell">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
              </svg>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger mt-2 ms-n2">
                2
                <span className="visually-hidden">unread messages</span>
              </span>
            </a>
            <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-0">
              <ul className="list-unstyled p-0 m-0">
                <li className="p-3 border-bottom ">
                  <div className="d-flex gap-3">
                    <img src="/src/admin/assets/images/avatar/avatar-1.jpg" alt="" className="avatar avatar-sm rounded-circle" />
                    <div className="flex-grow-1 small">
                      <p className="mb-0">New order received</p>
                      <p className="mb-1">Order #12345 has been placed</p>
                      <div className="text-secondary">5 minutes ago</div>
                    </div>
                  </div>
                </li>
                <li className="p-3 border-bottom ">
                  <div className="d-flex gap-3">
                    <img src="/src/admin/assets/images/avatar/avatar-4.jpg" alt="" className="avatar avatar-sm rounded-circle" />
                    <div className="flex-grow-1 small">
                      <p className="mb-0">New user registered</p>
                      <p className="mb-1">User @john_doe has signed up</p>
                      <div className="text-secondary">30 minutes ago</div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          
          {/* Dropdown */}
          <li className="ms-3 dropdown">
            <a href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="/src/admin/assets/images/avatar/avatar-1.jpg" alt="" className="avatar avatar-sm rounded-circle" />
            </a>
            <div className="dropdown-menu dropdown-menu-end p-0" style={{ minWidth: '200px' }}>
              <div>
                <div className="d-flex gap-3 align-items-center border-dashed border-bottom px-3 py-3">
                  <img src="/src/admin/assets/images/avatar/avatar-1.jpg" alt="" className="avatar avatar-md rounded-circle" />
                  <div>
                    <h4 className="mb-0 small">Shrina Tesla</h4>
                    <p className="mb-0  small">@imshrina</p>
                  </div>
                </div>
                <div className="p-3 d-flex flex-column gap-1 small lh-lg">
                  <a href="#!" className=""><span>Home</span></a>
                  <a href="#!" className=""><span>Inbox</span></a>
                  <a href="#!" className=""><span>Account Settings</span></a>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
