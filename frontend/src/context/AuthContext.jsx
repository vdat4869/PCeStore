import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage khi khởi tạo
    const token = localStorage.getItem('adminToken');
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
    
    if (token && isAuthenticated) {
      setIsLoggedIn(true);
      // Giả sử ta lấy thêm thông tin user từ token hoặc API khác
      setUser({ token }); 
    }
  }, []);

  const login = (token, userData = {}) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('isAdminAuthenticated', 'true');
    setIsLoggedIn(true);
    setUser({ ...userData, token });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminAuthenticated');
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
