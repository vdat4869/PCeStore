import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import AdminApp from './admin/App'; // Import the dashboard template
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute guard

// Component Layout Chung cho luồng Khách Hàng
const MainLayout = () => {
  return (
    <>
      <Header />
      <main className="flex-grow-1 bg-light pt-4" style={{ minHeight: '60vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container d-flex flex-column min-vh-100">
        <Routes>
          {/* Main App Routes with Header & Footer Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Product />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Admin Dashboard Route (Isolates styling & layout) */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminApp />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
