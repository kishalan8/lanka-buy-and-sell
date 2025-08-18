import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ClipboardList,
  Users,
  CheckSquare,
  BarChart3,
  Shield,
  UserCog,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/agent-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agent-dashboard/leads", label: "Leads", icon: ClipboardList },
  { to: "/agent-dashboard/client", label: "Agents", icon: Users },
  { to: "/agent-dashboard/mytasks", label: "Tasks", icon: CheckSquare },
  { to: "/agent-dashboard/reports", label: "Reports", icon: BarChart3 },
  { to: "/agent-dashboard/candidatepage", label: "Managed Candidates", icon: BarChart3 },
];


const SidebarItem = ({ to, icon: Icon, label, index, isActive, isOpen, toggleOpen }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {to ? (
        <Link
          to={to}
          className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
            isActive ? "text-white bg-blue-600" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="flex-1">{label}</span>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              isActive || isHovered ? "rotate-90" : ""
            }`}
          />
        </Link>
      ) : (
        <button
          onClick={toggleOpen}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium w-full text-left hover:bg-gray-100"
        >
          <Icon className="w-5 h-5" />
          <span className="flex-1">{label}</span>
          <ChevronRight className={`w-4 h-4 ${isOpen ? "rotate-90" : ""}`} />
        </button>
      )}
    </motion.div>
  );
};

const AgentDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.split("/").slice(-1)[0]; // last part of URL
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            className="w-64 bg-white/90 backdrop-blur-lg border-r border-white/30 z-50 shadow-lg p-6 flex flex-col"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-8">
              <img src="/blue-whale-logo.webp" alt="Logo" className="h-12" />
              <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
                <X />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item, idx) =>
                item.children ? (
                  <div key={item.label}>
                    <SidebarItem
                      label={item.label}
                      icon={item.icon}
                      index={idx}
                      isOpen={adminOpen}
                      toggleOpen={() => setAdminOpen((prev) => !prev)}
                    />
                    <AnimatePresence>
                      {adminOpen && (
                        <motion.div
                          className="ml-4 space-y-1"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          {item.children.map((child, cIdx) => (
                            <SidebarItem
                              key={child.to}
                              {...child}
                              index={cIdx}
                              isActive={currentPath === child.to.split("/").pop()}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <SidebarItem
                    key={item.to}
                    {...item}
                    index={idx}
                    isActive={currentPath === item.to.split("/").pop()}
                  />
                )
              )}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AgentDashboardLayout;
