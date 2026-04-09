import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kiểm tra token ưu tiên adminToken (Admin/Employee) hoặc userToken (Khách hàng)
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    const token = adminToken || userToken;
    
    if (token) {
      setIsLoggedIn(true);
      // Gọi API lấy tên user từ DB để hiện lên Header
      fetch('http://localhost:8080/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const userName = data.fullName || (data.email ? data.email.split('@')[0] : 'Khách hàng');
          setUser({ token, name: userName, email: data.email, role: localStorage.getItem('userRole') });
        }
      })
      .catch(err => {
         console.error(err);
         setUser({ token, name: 'Khách hàng' });
      });
    }
  }, []);

  const login = (token, role, userData = {}) => {
    if (role === 'ADMIN' || role === 'EMPLOYEE') {
       localStorage.setItem('adminToken', token);
       localStorage.setItem('isAdminAuthenticated', 'true');
    } else {
       localStorage.setItem('userToken', token);
       localStorage.removeItem('isAdminAuthenticated');
    }
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
    setUser({ ...userData, token, role });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
