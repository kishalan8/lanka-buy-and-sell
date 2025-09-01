import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/AdminDashboard';
import AdminUsedBikes from './pages/AdminUsedBikes';
import AdminSlider from './pages/AdminSlider';
import LoginPage from './pages/LoginPage';
import BikesPage from './pages/BikesPage';
import AdminSubmissions from './pages/AdminSubmissions';
import AdminUsers from './pages/AdminUsers';
import DashboardLayout from './pages/DashboardLayout';
import AdminChat from './pages/AdminChat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/used-bikes" element={<AdminUsedBikes />} />
          <Route path="/admin/slider" element={<AdminSlider />} />
          <Route path="/bikes" element={<BikesPage />} />
          <Route path="/submissions" element={<AdminSubmissions />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/adminchat" element={<AdminChat />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
