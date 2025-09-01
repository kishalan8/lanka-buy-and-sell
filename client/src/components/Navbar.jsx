import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion";
import { User, LogIn, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Navbar container */}
      <div className="w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container-global py-3 flex justify-between items-center"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/blue-whale-logo.webp"
              className="h-12 w-auto"
              alt="Blue Whale Migration Logo"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-primary hover:shadow-md">
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[var(--color-secondary)] border-2 border-[var(--color-secondary)]/50 hover:bg-blue-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[var(--color-secondary)] border-2 border-[var(--color-secondary)]/50 hover:bg-blue-50">
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-primary hover:shadow-md">
                    <UserPlus className="w-5 h-5" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </motion.header>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="top-16 left-0 right-0 bg-white shadow-lg z-40 border-t border-gray-200 pt-4 pb-6"
        >
          <div className="px-4 flex flex-col space-y-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-primary hover:shadow-md">
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-[var(--color-secondary)] border border-blue-100 hover:bg-blue-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/">
                  <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-[var(--color-secondary)] border border-blue-100 hover:bg-blue-50">
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-gradient-primary hover:shadow-md">
                    <UserPlus className="w-5 h-5" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
