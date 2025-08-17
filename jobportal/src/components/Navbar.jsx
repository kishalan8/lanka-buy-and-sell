import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion";
import { User, LogIn, UserPlus, Briefcase, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { user, admin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        {/* Container */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container-global py-2 flex justify-between items-center"
        >
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/">
              <button className="flex items-center transition-all duration-300 cursor-pointer">
                <img src="/blue-whale-logo.webp" className="w-auto h-15" alt="Blue Whale Migraton Logo" />
              </button>
            </Link>
          </motion.div>

          {/* Desktop buttons */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex items-center gap-4"
          >
            {user || admin ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to={admin ? "/admin" : "/dashboard"}>
                    <button className="relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-primary hover:shadow-md cursor-pointer">
                      <User className="w-5 h-5" />
                      <span>{admin ? "Admin Panel" : "Dashboard"}</span>
                    </button>
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[var(--color-secondary)] hover:bg-blue-50 transition-colors duration-300 border-2 border-[var(--color-secondary)]/50 cursor-pointer"
                  >
                    <span>Logout</span>
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                {/* Login Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[var(--color-secondary)] hover:bg-blue-50 transition-colors duration-300 border-2 border-[var(--color-secondary)]/50 cursor-pointer">
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                  </Link>
                </motion.div>

                {/* Sign Up Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-primary hover:shadow-md cursor-pointer">
                      <UserPlus className="w-5 h-5" />
                      <span>Sign Up</span>
                    </button>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </motion.header>
      </div>

      {/* Mobile Menu*/}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="top-16 md:top-20 left-0 right-0 bg-white shadow-lg z-40 border-t border-gray-200 pt-4 pb-6"
        >
          <div className="px-4 sm:px-6">
            <div className="flex flex-col space-y-4">
              {user || admin ? (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link to={admin ? "/admin" : "/dashboard"}>
                      <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-primary hover:shadow-md">
                        <User className="w-5 h-5" />
                        <span>{admin ? "Admin Panel" : "Dashboard"}</span>
                      </button>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-[var(--color-secondary)] hover:bg-blue-50 transition-colors duration-300 border border-blue-100 cursor-pointer"
                    >
                      <span>Logout</span>
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Mobile Login Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/login">
                      <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-[var(--color-secondary)] hover:bg-blue-50 transition-colors duration-300 border border-blue-100 cursor-pointer">
                        <LogIn className="w-5 h-5" />
                        <span>Login</span>
                      </button>
                    </Link>
                  </motion.div>

                  {/* Mobile Sign Up Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/signup">
                      <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-primary hover:shadow-md cursor-pointer">
                        <UserPlus className="w-5 h-5" />
                        <span>Sign Up</span>
                      </button>
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;