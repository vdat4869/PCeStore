import React from 'react';
import { Routes, Route } from 'react-router-dom';
import * as bootstrap from 'bootstrap';
import './assets/scss/style.scss';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CreateProduct from './pages/CreateProduct';
import Reports from './pages/Reports';
import Docs from './pages/Docs';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="create-product" element={<CreateProduct />} />
          <Route path="reports" element={<Reports />} />
          <Route path="docs" element={<Docs />} />
        </Route>
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    
  );
}

export default App;
