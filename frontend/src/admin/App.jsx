import React from 'react';
import { Routes, Route } from 'react-router-dom';
import * as bootstrap from 'bootstrap';
import './assets/scss/style.scss';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CreateProduct from './pages/CreateProduct';
import Reports from './pages/Reports';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Docs from './pages/Docs';
import NotFound from './pages/NotFound';

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Inventory />} />
          <Route path="create-product" element={<CreateProduct />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    
  );
}

export default App;
