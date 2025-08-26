import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Fixed import

import AuthModal from './AuthModal';
import logo from '../assets/logo.png'; // Correct logo import

const Navbar = () => {
  const [showModal, setShowModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    } else {
      setLoggedIn(false);
      setIsAdmin(false);
    }
  }, [showModal]);

  const handleSignOut = () => {
    const confirmed = window.confirm("Are you sure you want to sign out?");
    if (!confirmed) return;

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setLoggedIn(false);
    setIsAdmin(false);
    window.location.href = '/'; // optional redirect after sign-out
  };

  const isActive = (path) =>
    location.pathname === path ? 'text-red-600 font-semibold' : 'hover:text-red-500';

  return (
    <>
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="w-44">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-12 object-contain" />
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="space-x-4 md:space-x-6 text-gray-700 font-medium hidden md:flex">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/new-bikes" className={isActive('/new-bikes')}>New Bikes</Link>
          <Link to="/used-bikes" className={isActive('/used-bikes')}>Used Bikes</Link>
          <Link to="/sell" className={isActive('/sell')}>Sell Your Bike</Link>
          <Link to="/contact" className={isActive('/contact')}>Contact Us</Link>
          {isAdmin && (
            <Link to="/admin" className={isActive('/admin')}>Admin</Link>
          )}
        </div>

        {/* Authentication Button */}
        <div>
          {loggedIn ? (
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Navbar;
