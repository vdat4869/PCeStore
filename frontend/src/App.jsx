import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminApp from './admin/App'; // Import the dashboard template

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
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Admin Dashboard Route (Isolates styling & layout) */}
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
