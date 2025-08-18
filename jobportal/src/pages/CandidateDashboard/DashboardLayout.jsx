import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ClipboardList,
  MessageSquare,
  FileText,
  User,
  LogOut,
  Home,
  ChevronRight,
  Heart
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "profile", label: "Profile", icon: User },
  { to: "applications", label: "My Applications", icon: ClipboardList },
  { to: "saved-jobs", label: "Saved Jobs", icon: Heart },
  { to: "chats", label: "chat", icon: MessageSquare },
  { to: "documents", label: "Documents", icon: FileText },
];

const SidebarItem = ({ to, icon: Icon, label, onClick, index, isActive = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link
        to={to}
        onClick={onClick}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden w-full text-left ${
          isActive 
            ? "text-white" 
            : "text-muted-dark hover:text-gray-900"
        }`}
      >
        {/* Active state background (full color) */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(90deg, #1B3890, #0F79C5)"
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Hover state background (subtle) */}
        {isHovered && !isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Hover border animation */}
        {isHovered && !isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 pointer-events-none"
            style={{
              borderColor: "rgba(27, 56, 144, 0.3)"
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        <div className="relative z-10 flex items-center gap-3 w-full">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className={`w-5 h-5 transition-colors ${
              isActive ? "text-white" : "text-gray-600 group-hover:text-[#1B3890]"
            }`} />
          </motion.div>
          
          <span className="flex-1 text-description-sm">{label}</span>
          
          <motion.div
            className={`transition-all ${
              isActive ? "text-white opacity-100" 
              : "text-gray-400 opacity-0 group-hover:opacity-100"
            }`}
            animate={{
              x: (isActive || isHovered) ? 0 : -10
            }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'profile';

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
    const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col md:flex-row relative bg-gradient-soft"
    >
      {/* Mobile Header */}
      <motion.header 
        className="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-description-lg font-bold bg-gradient-primary bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Dashboard Menu
        </motion.h1>
        <motion.button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-gradient-primary text-white shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={sidebarOpen ? "close" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </motion.header>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !window.matchMedia("(max-width: 768px)").matches) && (
          <>
            <motion.aside
              className={`fixed lg:pt-10 md:relative top-0 left-0 w-72 h-content bg-white/90 backdrop-blur-xl border-r border-white/30 z-50 shadow-2xl md:shadow-lg`}
              initial={{ x: -288, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -288, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4 
              }}
            >
              <div className="p-8 space-y-8 h-screen flex flex-col">
                {/* Close button for mobile */}
                <div className="md:hidden flex justify-end">
                  <button 
                    onClick={closeSidebar}
                    className="p-2 rounded-full text-muted-dark hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h2 className="text-heading-lg bg-gradient-primary bg-clip-text text-transparent">
                    Dashboard
                  </h2>
                  <motion.div 
                    className="h-1 w-16 rounded-full mt-2"
                    style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
                    initial={{ width: 0 }}
                    animate={{ width: 64 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </motion.div>

                {/* Navigation */}
                <motion.nav 
                  className="flex flex-col space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {navItems.map((item, index) => (
                    <SidebarItem 
                      key={item.to} 
                      {...item} 
                      onClick={closeSidebar} 
                      index={index} 
                      isActive={currentPath === item.to}
                    />
                  ))}
                  
                  {/* Back to Jobs */}
                  <motion.div
                    className="pt-6 mt-6 border-t border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Link
                      to="/jobs"
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-white font-medium transition-all duration-300 relative overflow-hidden"
                      onClick={closeSidebar}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                        style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="relative z-10 flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Home className="w-5 h-5" />
                        </motion.div>
                        Back to Jobs
                      </div>
                    </Link>
                  </motion.div>
                </motion.nav>

                {/* Logout Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <motion.button 
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:text-white font-medium transition-all duration-300 relative overflow-hidden w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
  logout();
  navigate('/login');
}}

                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                    <div className="relative z-10 flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <LogOut className="w-5 h-5" />
                      </motion.div>
                      Logout
                    </div>
                  </motion.button>
                </motion.div>
              </div>
            </motion.aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
              <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                onClick={closeSidebar}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main 
        className="flex-1 lg:p-12 overflow-y-auto relative"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 right-20 w-32 h-32 rounded-full opacity-10"
            style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
          />
          <div
            className="absolute bottom-20 left-20 w-24 h-24 rounded-full opacity-10"
            style={{ background: "linear-gradient(90deg, #0F79C5, #1B3890)" }}
          />
        </div>

        {/* Content wrapper with glass effect */}
        <motion.div
          className="relative z-10 bg-white/50 backdrop-blur-sm lg:rounded-2xl p-8 min-h-full shadow-xl border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Outlet />
        </motion.div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;