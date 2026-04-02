import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminApp from './admin/App'; // Import the dashboard template

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Header/Navbar component can be placed here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin Dashboard Route */}
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
        {/* Footer component can be placed here */}
      </div>
    </Router>
  );
}

export default App;
