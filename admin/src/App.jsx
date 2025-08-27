import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/AdminDashboard';
import AdminUsedBikes from './pages/AdminUsedBikes';
import AdminSlider from './pages/AdminSlider';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/used-bikes" element={<AdminUsedBikes />} />
        <Route path="/admin/slider" element={<AdminSlider />} />
      </Routes>

    </Router>
  );
}

export default App;
