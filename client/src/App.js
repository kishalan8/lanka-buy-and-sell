import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewBikes from './pages/NewBikes';
import UsedBikes from './pages/UsedBikes';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/AdminDashboard';
import AdminUsedBikes from './pages/AdminUsedBikes';
import BikeDetails from './pages/BikeDetails';
import SellBike from './pages/SellBike';
import AdminSlider from './pages/AdminSlider';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-bikes" element={<NewBikes />} />
        <Route path="/used-bikes" element={<UsedBikes />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/used-bikes" element={<AdminUsedBikes />} />
        <Route path="/bike/:id" element={<BikeDetails />} />
        <Route path="/sell" element={<SellBike />} />
        <Route path="/admin/slider" element={<AdminSlider />} />

        


      </Routes>

    </Router>
  );
}

export default App;
