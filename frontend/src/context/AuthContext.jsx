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
    // Ưu tiên adminToken nếu có, nếu không thì dùng userToken
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    
    if (token) {
      setIsLoggedIn(true);
      fetch('http://localhost:8080/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : (logout(), null))
      .then(data => {
        if (data) {
          setUser({ 
            token, 
            name: data.fullName || (data.email ? data.email.split('@')[0] : 'Tài khoản'), 
            email: data.email, 
            role: localStorage.getItem('userRole'),
            avatarUrl: data.avatarUrl
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
    } else {
       localStorage.setItem('userToken', token);
       localStorage.removeItem('isAdminAuthenticated');
    }
    
    setIsLoggedIn(true);
    setUser({ 
      ...userData, 
      token, 
      role,
      name: userData.fullName || userData.name || 'Tài khoản'
    });
  };

  const updateUserInfo = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateUserInfo }}>
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
