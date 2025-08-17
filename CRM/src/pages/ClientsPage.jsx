import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronDown, Edit2, Trash2, User, Briefcase, Filter, Eye, Phone, Mail } from 'lucide-react';

const ClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedAdmin = JSON.parse(localStorage.getItem("authUser"));
    if (!token || !storedAdmin) return;

    setAdmin(storedAdmin); // store logged in admin
    let mounted = true;
    setLoading(true);

    axios.get(`http://localhost:5000/api/users/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!mounted) return;
        let fetchedUsers = Array.isArray(res.data) ? res.data : [];

        // ✅ Filter based on admin role
        if (storedAdmin.role === "SalesAdmin") {
          fetchedUsers = fetchedUsers.filter(u => u.userType === "candidate");
        } else if (storedAdmin.role === "AgentAdmin") {
          fetchedUsers = fetchedUsers.filter(u => u.userType === "agent");
        }

        setUsers(fetchedUsers);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        if (mounted) setError('Failed to load users');
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  // Convert MongoDB user data into the "lead" format
  const leads = users.map(user => ({
    id: user._id || user.id || Math.random().toString(36).slice(2, 9),
    name: user.fullname || `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.name || 'Unknown',
    type: user.userType,
    email: user.email || 'N/A',
    status: user.status || 'New Lead',
    assigned: user.consultantName || user.assigned || 'N/A',
    contact: user.email || 'N/A',
    phone: user.phoneNumber || user.phone || 'N/A',
    lastContact: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : (user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '-'),
  }));

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.contact || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || lead.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesAssigned = assignedFilter === 'All' || lead.assigned === assignedFilter;
    return matchesSearch && matchesType && matchesStatus && matchesAssigned;
  });

  // Pagination
  const leadsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / leadsPerPage));
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 p-4 md:p-6"
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
                Clients Management
              </motion.h1>
              <p className="text-muted-dark text-sm sm:text-base">Manage your Clients</p>
              <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {filteredLeads.length} Active Clients
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
                className="group relative overflow-hidden flex items-center gap-2 sm:gap-3 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl bg-gradient-primary transition-all duration-300 text-sm sm:text-base"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(15, 121, 197, 0.1)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus size={16} className="sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span className="hidden  sm:inline">Add New Client</span>
                <span className="sm:hidden">Add Client</span>
              </motion.button>
            </motion.div>
          </motion.div>
  
          {/* Search and Filters */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl border border-white/20"
          >
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-full lg:max-w-md">
                <motion.div
                  className="absolute inset-y-0 z-1 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"
                  animate={{
                    scale: searchQuery ? [1, 1.2, 1] : 1,
                    color: searchQuery ? '#0F79C5' : '#6B7280'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Search size={18} className="sm:w-5 sm:h-5" />
                </motion.div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-10 sm:pl-12 w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
  
              {/* Filters */}
              <div className="flex gap-2 sm:gap-4 flex-wrap">
                {[
                  { label: 'Type', value: typeFilter, setter: setTypeFilter, options: ['All', 'Customer', 'Agent'] },
                  { label: 'Status', value: statusFilter, setter: setStatusFilter, options: ['All', 'Initial Contact', 'Assessment', 'Documentation', 'Visa Processing', 'Offer Received', 'Completed', 'Rejected'] },
                  { label: 'Consultant', value: assignedFilter, setter: setAssignedFilter, options: ['All', 'Sarah Johnson', 'Mike Chen', 'David Wilson', 'Emma Davis'] }
                ].map((filter, index) => (
                  <motion.div
                    key={filter.label}
                    className="relative flex-1 min-w-[120px] sm:min-w-0 sm:flex-none"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <select
                      className="appearance-none bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-8 sm:pr-10 focus:outline-none focus:ring-2 focus:ring-[#0F79C5] focus:border-transparent transition-all duration-300 hover:shadow-md cursor-pointer w-full text-xs sm:text-sm"
                      value={filter.value}
                      onChange={(e) => filter.setter(e.target.value)}
                    >
                      {filter.options.map(option => (
                        <option key={option} value={option}>
                          {option === 'All' ?
                            (filter.label === 'Status' ? 'All Status' : `All ${filter.label}s`) :
                            option}
                        </option>
                      ))}
                    </select>
                    <motion.div
                      className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none"
                      animate={{ rotate: filter.value !== 'All' ? 360 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown
                        size={16}
                        className={`sm:w-[18px] sm:h-[18px] ${filter.value !== 'All' ? 'text-[var(--color-secondary)]' : 'text-gray-500'}`}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
  
          {/* Leads Table */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-description-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Filter size={18} className="sm:w-5 sm:h-5 text-[#0F79C5]" />
                  Client Overview
                </h3>
                <div className="text-xs sm:text-sm text-gray-500">
                  {filteredLeads.length} of {leads.length} Client
                </div>
              </div>
            </div>
  
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {[
                      'Lead Information',
                      'Type',
                      'Profession',
                      'Status',
                      'Priority',
                      'Assigned',
                      'Last Contact',
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
                    {paginatedLeads.length > 0 ? (
                      paginatedLeads.map((lead, index) => (
                        <motion.tr
                          key={lead.id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-100"
                          onMouseEnter={() => setHoveredRow(lead.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center space-x-3">
                              <motion.div
                                className={`p-2 rounded-xl ${lead.type === 'Customer' ? 'bg-blue-100' : 'bg-indigo-100'}`}
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                              >
                                {lead.type === 'Customer' ? (
                                  <User className={`h-5 w-5 ${lead.type === 'Customer' ? 'text-blue-600' : 'text-indigo-600'}`} />
                                ) : (
                                  <Briefcase className="h-5 w-5 text-indigo-600" />
                                )}
                              </motion.div>
                              <div className="space-y-2">
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                  {lead.name}
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-muted-dark">
                                  <Mail size={12} />
                                  <span>{lead.contact}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-muted-dark">
                                  <Phone size={12} />
                                  <span>{lead.phone}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <motion.span
                              className={`px-3 py-1 text-xs font-semibold rounded-full border ${lead.type === 'Customer'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                }`}
                              whileHover={{ scale: 1.05 }}
                            >
                              {lead.type}
                            </motion.span>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-700">{lead.profession}</td>
                          <td className="px-4 py-4">
                            <motion.span
                              className={`px-3 py-1 text-xs font-semibold rounded-full border ${lead.status === 'Initial Contact' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  lead.status === 'Assessment' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                    lead.status === 'Documentation' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                      lead.status === 'Visa Processing' ? 'bg-green-100 text-green-800 border-green-200' :
                                        lead.status === 'Offer Received' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                                          lead.status === 'Completed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                            'bg-red-100 text-red-800 border-red-200'
                                }`}
                              whileHover={{ scale: 1.05 }}
                            >
                              {lead.status}
                            </motion.span>
                          </td>
                          <td className="px-4 py-4">
                            <motion.span
                              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(lead.priority)}`}
                              whileHover={{ scale: 1.05 }}
                            >
                              {lead.priority}
                            </motion.span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-medium text-gray-700">{lead.assigned}</span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">{lead.lastContact}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              {[
                                { icon: Eye, color: 'text-blue-600 hover:text-blue-800' },
                                { icon: Edit2, color: 'text-green-600 hover:text-green-800' },
                                { icon: Trash2, color: 'text-red-600 hover:text-red-800' },
                              ].map(({ icon: Icon, color }, idx) => (
                                <motion.button
                                  key={idx}
                                  className={`p-2 rounded-lg cursor-pointer transition-all duration-100 ${color} hover:bg-white hover:shadow-md`}
                                  whileHover={{ scale: 1.1, rotate: idx === 0 ? 0 : 15 }}
                                  whileTap={{ scale: 0.9 }}
                                  initial={{ opacity: 0.7 }}
                                  animate={{ opacity: hoveredRow === lead.id ? 1 : 0.7 }}
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
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Search size={24} className="text-gray-400" />
                            </div>
                            <div className="text-gray-500">
                              <p className="text-lg font-medium">No leads found</p>
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
                {paginatedLeads.length > 0 ? (
                  <div className="space-y-4 p-4">
                    {paginatedLeads.map((lead, index) => (
                      <motion.div
                        key={lead.id}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <motion.div
                              className={`p-2 rounded-xl ${lead.type === 'Customer' ? 'bg-blue-100' : 'bg-indigo-100'}`}
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ duration: 0.5 }}
                            >
                              {lead.type === 'Customer' ? (
                                <User className={`h-4 w-4 ${lead.type === 'Customer' ? 'text-blue-600' : 'text-indigo-600'}`} />
                              ) : (
                                <Briefcase className="h-4 w-4 text-indigo-600" />
                              )}
                            </motion.div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{lead.name}</h4>
                              <p className="text-xs text-gray-600">{lead.profession}</p>
                            </div>
                          </div>
                          <motion.span
                            className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(lead.priority)}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {lead.priority}
                          </motion.span>
                        </div>
  
                        {/* Contact Info */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Mail size={12} />
                            <span className="truncate">{lead.contact}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Phone size={12} />
                            <span>{lead.phone}</span>
                          </div>
                        </div>
  
                        {/* Status and Type */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-wrap gap-2">
                            <motion.span
                              className={`px-2 py-1 text-xs font-semibold rounded-full border ${lead.type === 'Customer'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                }`}
                              whileHover={{ scale: 1.05 }}
                            >
                              {lead.type}
                            </motion.span>
                            <motion.span
                              className={`px-2 py-1 text-xs font-semibold rounded-full border ${lead.status === 'Initial Contact' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  lead.status === 'Assessment' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                    lead.status === 'Documentation' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                      lead.status === 'Visa Processing' ? 'bg-green-100 text-green-800 border-green-200' :
                                        lead.status === 'Offer Received' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                                          lead.status === 'Completed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                            'bg-red-100 text-red-800 border-red-200'
                                }`}
                              whileHover={{ scale: 1.05 }}
                            >
                              {lead.status}
                            </motion.span>
                          </div>
                        </div>
  
                        {/* Bottom section */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            <div>Assigned: {lead.assigned}</div>
                            <div>Last contact: {lead.lastContact}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[
                              { icon: Eye, color: 'text-blue-600' },
                              { icon: Edit2, color: 'text-green-600' },
                              { icon: Trash2, color: 'text-red-600' },                            
                            ].map(({ icon: Icon, color }, idx) => (
                              <motion.button
                                key={idx}
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
                        <p className="text-lg font-medium">No leads found</p>
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
                Showing {(currentPage - 1) * leadsPerPage + 1} to {Math.min(currentPage * leadsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
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
  
          {/* Loading / Error states */}
          {loading && (
            <div className="mt-4 text-center text-sm text-gray-500">Loading users...</div>
          )}
          {error && (
            <div className="mt-4 text-center text-sm text-red-500">{error}</div>
          )}
        </div>
      </motion.div>
    );
};

export default ClientsPage;
