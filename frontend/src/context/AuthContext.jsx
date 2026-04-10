import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUser(null);
  };

  useEffect(() => {
    // Chỉ tự động đăng nhập cho Khách hàng (userToken)
    // adminToken sẽ được dùng riêng cho ProtectedRoute của Dashboard
    const userToken = localStorage.getItem('userToken');
    
    if (userToken) {
      setIsLoggedIn(true);
      fetch('http://localhost:8080/api/users/profile', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      .then(res => res.ok ? res.json() : (logout(), null))
      .then(data => {
        if (data) {
          setUser({ 
            token: userToken, 
            name: data.fullName || (data.email ? data.email.split('@')[0] : 'Khách hàng'), 
            email: data.email, 
            role: 'USER' 
          });
        }
      })
      .catch(err => {
         console.error('Auth check failed:', err);
         logout();
      });
    }
  }, []);

  const login = (token, role, userData = {}) => {
    localStorage.setItem('userRole', role);
    
    if (role === 'ADMIN' || role === 'EMPLOYEE') {
       localStorage.setItem('adminToken', token);
       localStorage.setItem('isAdminAuthenticated', 'true');
       // Không set isLoggedIn = true cho Admin ở Store để tránh hiện tên Admin trên Header
       setIsLoggedIn(false);
       setUser(null);
    } else {
       localStorage.setItem('userToken', token);
       localStorage.removeItem('isAdminAuthenticated');
       setIsLoggedIn(true);
       setUser({ ...userData, token, role });
    }
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
