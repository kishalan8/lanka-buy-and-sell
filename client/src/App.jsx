import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BikeDetails from './pages/BikeDetails';
import SellBike from './pages/SellBike';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import BikeListings from './pages/BikeListings';
import DashboardLayout from './pages/DashboardLayout';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import EditProfile from './pages/EditProfile';
import SavedBikes from './pages/SavedBikes';
import SubmissionsPage from './pages/SubmissionsPage';
import { AuthProvider } from './context/AuthContext';

function AppLayout({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/signup'];
  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      {children}

      <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/bike/:id" element={<BikeDetails />} />
          <Route path="/sell" element={<SellBike />} />
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/bikes" element={<BikeListings />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="profile" element={<Profile />} />
          <Route path="saved-bikes" element={<SavedBikes />} />
          <Route path="chats" element={<Chat />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="submissions" element={<SubmissionsPage />} />
        </Route>
        
        </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
