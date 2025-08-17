import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronDown, Edit2, Trash2, MoreVertical, User, Briefcase, Shield, Mail, Phone, Lock, Check, X, List, Filter, Calendar } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import AddUserModal from "../components/AddUserModal";
import EditUserModal from "../components/EditUserModal";

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    // Delete logic 
    console.log("Deleting user:", user);
  };

  const handleAddUser = (newUser) => {
    // API call to create user with password
    console.log("New user added:", newUser);
    alert(`New user ${newUser.name} has been created successfully!`);
  };

  const handleSaveUser = (updatedUser) => {
    // API call to update user
    console.log("User updated:", updatedUser);
    alert(`User ${updatedUser.name} has been updated successfully!`);
  };

const users = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@migrationco.com',
    phone: '+1 (555) 123-4567',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2023-06-20 14:30',
    createdAt: '2022-01-15'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@migrationco.com',
    phone: '+1 (555) 234-5678',
    role: 'Sales',
    status: 'Active',
    lastLogin: '2023-06-18 09:15',
    createdAt: '2022-03-10'
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@migrationco.com',
    phone: '+1 (555) 345-6789',
    role: 'Agent',
    status: 'Active',
    lastLogin: '2023-06-15 11:45',
    createdAt: '2022-05-20'
  },
  {
    id: 4,
    name: 'Emma Davis',
    email: 'emma.davis@migrationco.com',
    phone: '+1 (555) 456-7890',
    role: 'Sales',
    status: 'Inactive',
    lastLogin: '2023-05-10 16:20',
    createdAt: '2022-07-05'
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.w@migrationco.com',
    phone: '+1 (555) 567-8901',
    role: 'Agent',
    status: 'Active',
    lastLogin: '2023-06-19 13:10',
    createdAt: '2022-09-12'
  },
  {
    id: 6,
    name: 'Lisa Brown',
    email: 'lisa.brown@migrationco.com',
    phone: '+1 (555) 678-9012',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2023-06-17 10:05',
    createdAt: '2022-11-30'
  },
];

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const usersPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Sales': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Agent': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
      : 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 md:p-6"
    >
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 text-center md:text-left"
        >
          <div className="space-y-2">
            <motion.h1
              className="text-heading-lg font-bold bg-gradient-primary bg-clip-text text-transparent"
            >
              Users Management
            </motion.h1>
            <p className="text-muted-dark text-sm sm:text-base">Manage your team members</p>
            <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {filteredUsers.filter(u => u.status === 'Active').length} Active Users
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Real-time Updates
              </span>
            </div>
          </div>
          <motion.div
            className="flex gap-3 mx-auto md:mx-0"
            whileHover={{ scale: 1.02 }}
          >
            <motion.button
              onClick={() => setIsAddUserOpen(true)}
              className="group relative overflow-hidden flex items-center gap-2 sm:gap-3 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl bg-gradient-primary transition-all duration-300 text-sm sm:text-base cursor-pointer"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(15, 121, 197, 0.1)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} className="sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" />
              <span className="hidden sm:inline">Add New User</span>
              <span className="sm:hidden">Add User</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 z-1" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 w-full py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none bg-white/80 backdrop-blur-sm transition-all text-sm sm:text-base duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Sales">Sales</option>
                <option value="Agent">Agent</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <h3 className="text-description-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter size={18} className="sm:w-5 sm:h-5 text-[var(--color-secondary)]" />
                Users Overview
              </h3>
              <div className="text-xs sm:text-sm text-gray-500">
                {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {[
                    'User Information',
                    'Role',
                    'Status',
                    'Last Login',
                    'Created At',
                    'Actions'
                  ].map((header, index) => (
                    <motion.th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {header}
                    </motion.th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence mode="wait">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-100"
                        onMouseEnter={() => setHoveredRow(user.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <motion.div
                              className={`p-2 rounded-xl ${
                                user.role === 'Admin' ? 'bg-purple-100' : 
                                user.role === 'Sales' ? 'bg-blue-100' : 'bg-green-100'
                              }`}
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ duration: 0.5 }}
                            >
                              {user.role === 'Admin' ? (
                                <Shield className="h-5 w-5 text-purple-600" />
                              ) : user.role === 'Sales' ? (
                                <Briefcase className="h-5 w-5 text-blue-600" />
                              ) : (
                                <User className="h-5 w-5 text-green-600" />
                              )}
                            </motion.div>
                            <div
                              className="space-y-2 cursor-pointer">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                {user.name}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-dark">
                                <Mail size={12} />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-dark">
                                <Phone size={12} />
                                <span>{user.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <motion.span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {user.role}
                          </motion.span>
                        </td>
                        <td className="px-4 py-4">
                          <motion.span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.status)}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {user.status}
                          </motion.span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-500">{user.lastLogin}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-500">{user.createdAt}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            {[
                              {
                                icon: Edit2,
                                color: 'text-green-600 hover:text-green-800',
                                action: () => handleEditUser(user)
                              },
                              {
                                icon: Trash2,
                                color: 'text-red-600 hover:text-red-800',
                                action: () => handleDeleteUser(user)
                              }].map(({ icon: Icon, color, action }, idx) => (
                                <motion.button
                                  key={idx}
                                  onClick={action}
                                  className={`p-2 rounded-lg cursor-pointer transition-all duration-100 ${color} hover:bg-white hover:shadow-md`}
                                  whileHover={{ scale: 1.1, rotate: idx === 0 ? 0 : 15 }}
                                  whileTap={{ scale: 0.9 }}
                                  initial={{ opacity: 0.7 }}
                                  animate={{ opacity: hoveredRow === user.id ? 1 : 0.7 }}
                                >
                                  <Icon size={16} />
                                </motion.button>
                              ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search size={24} className="text-gray-400" />
                          </div>
                          <div className="text-gray-500">
                            <p className="text-lg font-medium">No users found</p>
                            <p className="text-sm">Try adjusting your search criteria</p>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              {paginatedUsers.length > 0 ? (
                <div className="space-y-4 p-4">
                  {paginatedUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-center items-center"
                    >
                      {/* Header */}
                      <div className="flex flex-col gap-3 items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className={`p-2 rounded-xl ${
                              user.role === 'Admin' ? 'bg-purple-100' : 
                              user.role === 'Sales' ? 'bg-blue-100' : 'bg-green-100'
                            }`}
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {user.role === 'Admin' ? (
                              <Shield className="h-4 w-4 text-purple-600" />
                            ) : user.role === 'Sales' ? (
                              <Briefcase className="h-4 w-4 text-blue-600" />
                            ) : (
                              <User className="h-4 w-4 text-green-600" />
                            )}
                          </motion.div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-md">{user.name}</h4>
                            <p className="text-xs text-gray-600">{user.role}</p>
                          </div>
                        </div>
                        <motion.span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.status)}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {user.status}
                        </motion.span>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Mail size={12} />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Phone size={12} />
                          <span>{user.phone}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center space-x-2 text-xs">
                          <Calendar size={12} className="text-gray-500" />
                          <span className="text-gray-600">Last login: {user.lastLogin.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Calendar size={12} className="text-gray-500" />
                          <span className="text-gray-600">Created: {user.createdAt}</span>
                        </div>
                      </div>

                      {/* Bottom section */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          {[
                            {
                              icon: Edit2,
                              color: 'text-green-600',
                              action: () => handleEditUser(user)
                            },
                            {
                              icon: Trash2,
                              color: 'text-red-600',
                              action: () => handleDeleteUser(user)
                            },
                          ].map(({ icon: Icon, color, action }, idx) => (
                            <motion.button
                              key={idx}
                              onClick={action}
                              className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${color} hover:bg-gray-100`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Icon size={14} />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-between items-center mt-6 bg-white/70 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 gap-4"
          >
            <div className="text-xs sm:text-sm text-gray-600 font-medium text-center sm:text-left">
              Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-primary text-white hover:shadow-lg'
                  }`}
                whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
              >
                Previous
              </motion.button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <motion.button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm ${currentPage === page
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'
                      }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-primary text-white hover:shadow-lg'
                  }`}
                whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal 
  isOpen={isAddUserOpen} 
  onClose={() => setIsAddUserOpen(false)}
  onSave={handleAddUser}
/>
<EditUserModal 
  isOpen={isEditModalOpen} 
  onClose={() => setIsEditModalOpen(false)}
  onSave={handleSaveUser}
  user={currentUser}
/>
    </motion.div>
  );
};

export default UsersPage;