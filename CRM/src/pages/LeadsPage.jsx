import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronDown, Edit2, Trash2, MoreVertical, User, Briefcase, Filter, Eye, Phone, Mail } from 'lucide-react';
import LeadsFilters from "../components/LeadsFilter";
import { useNavigate } from "react-router-dom";
import LeadsDetailsPage from "./LeadsDetailsPage";
import AddLeadModal from "../components/AddLeadModal";
import EditLeadModal from "../components/EditLeadModal";

const LeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  const navigate = useNavigate();

  const handleLeadClick = (leadId) => {
    navigate(`/dashboard/leads/${leadId}`);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const handleEditLead = (lead) => {
    //  edit logic 
    console.log("Editing lead:", lead);
  };

  const handleDeleteLead = (lead) => {
    //  delete logic 
    console.log("Deleting lead:", lead);
  };

  const handleAddLead = (newLead) => {
    // api
    console.log("New lead added:", newLead);
    // For demo
    alert(`New lead for ${newLead.name} has been added successfully!`);
  };

  const handleSaveLead = (updatedLead) => {
    // api
    console.log("Lead updated:", updatedLead);
    // for demo
    alert(`Lead ${updatedLead.name} has been updated successfully!`);
  };

  const leads = [
    {
      id: 1,
      name: 'John Smith',
      type: 'Customer',
      profession: 'Software Engineer',
      status: 'Initial Contact',
      assigned: 'Sarah Johnson',
      contact: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      lastContact: '2023-05-15',
      priority: 'High'
    },
    {
      id: 2,
      name: 'Global Talent Agency',
      type: 'Agent',
      profession: 'Healthcare',
      status: 'Documentation',
      assigned: 'Mike Chen',
      contact: 'info@globaltalent.com',
      phone: '+1 (555) 987-6543',
      lastContact: '2023-05-18',
      priority: 'Medium'
    },
    {
      id: 3,
      name: 'Maria Garcia',
      type: 'Customer',
      profession: 'Nurse',
      status: 'Assessment',
      assigned: 'Sarah Johnson',
      contact: 'maria.g@email.com',
      phone: '+1 (555) 456-7890',
      lastContact: '2023-05-10',
      priority: 'High'
    },
    {
      id: 4,
      name: 'Elite Migration Partners',
      type: 'Agent',
      profession: 'Finance',
      status: 'Visa Processing',
      assigned: 'David Wilson',
      contact: 'contact@elitemigration.com',
      phone: '+1 (555) 321-0987',
      lastContact: '2023-05-20',
      priority: 'Low'
    },
    {
      id: 5,
      name: 'Ahmed Khan',
      type: 'Customer',
      profession: 'Construction Manager',
      status: 'Offer Received',
      assigned: 'Mike Chen',
      contact: 'ahmed.k@email.com',
      phone: '+1 (555) 654-3210',
      lastContact: '2023-05-17',
      priority: 'High'
    },
    {
      id: 6,
      name: 'Talent Bridge International',
      type: 'Agent',
      profession: 'Education',
      status: 'Completed',
      assigned: 'Emma Davis',
      contact: 'support@talentbridge.org',
      phone: '+1 (555) 789-0123',
      lastContact: '2023-05-05',
      priority: 'Low'
    },
    {
      id: 7,
      name: 'Sophie Martin',
      type: 'Customer',
      profession: 'Chef',
      status: 'Rejected',
      assigned: 'David Wilson',
      contact: 'sophie.m@email.com',
      phone: '+1 (555) 210-9876',
      lastContact: '2023-05-12',
      priority: 'Medium'
    },
  ];

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || lead.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesAssigned = assignedFilter === 'All' || lead.assigned === assignedFilter;
    return matchesSearch && matchesType && matchesStatus && matchesAssigned;
  });

  // Pagination
  const leadsPerPage = 5;
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
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
              Leads Management
            </motion.h1>
            <p className="text-muted-dark text-sm sm:text-base">Manage your agents and candidate leads</p>
            <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {filteredLeads.length} Active Leads
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
              onClick={() => setIsAddLeadOpen(true)}
              className="group relative overflow-hidden flex items-center gap-2 sm:gap-3 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl bg-gradient-primary transition-all duration-300 text-sm sm:text-base cursor-pointer"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(15, 121, 197, 0.1)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} className="sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" />
              <span className="hidden sm:inline">Add New Lead</span>
              <span className="sm:hidden">Add Lead</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <LeadsFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          assignedFilter={assignedFilter}
          setAssignedFilter={setAssignedFilter}
        />

        {/* Leads Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <h3 className="text-description-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter size={18} className="sm:w-5 sm:h-5 text-[var(--color-secondary)]" />
                Lead Overview
              </h3>
              <div className="text-xs sm:text-sm text-gray-500">
                {filteredLeads.length} of {leads.length} leads
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
                            <div
                              onClick={() => handleLeadClick(lead.id)}
                              className="space-y-2 cursor-pointer">
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
                              {
                                icon: Eye,
                                color: 'text-blue-600 hover:text-blue-800',
                                action: () => handleLeadClick(lead.id)
                              },
                              {
                                icon: Edit2,
                                color: 'text-green-600 hover:text-green-800',
                                action: (lead) => {
                                  setCurrentLead(lead);
                                  setIsEditModalOpen(true);
                                }
                              },
                              {
                                icon: Trash2,
                                color: 'text-red-600 hover:text-red-800',
                                action: () => handleDeleteLead(lead)
                              }].map(({ icon: Icon, color, action }, idx) => (
                                <motion.button
                                  key={idx}
                                  onClick={action}
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
                <div className="divide-y divide-gray-200">
                  {paginatedLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      className="p-6 space-y-3"
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Header with name and priority */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${lead.type === 'Customer' ? 'bg-blue-100' : 'bg-indigo-100'}`}>
                            {lead.type === 'Customer' ? (
                              <User className={`h-5 w-5 ${lead.type === 'Customer' ? 'text-blue-600' : 'text-indigo-600'}`} />
                            ) : (
                              <Briefcase className="h-5 w-5 text-indigo-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                            <p className="text-sm text-gray-600">{lead.profession}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>

                      {/* Contact info */}
                      <div className="space-y-2 text-xs flex flex-col items-center">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} />
                          <span>{lead.contact}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          <span>{lead.phone}</span>
                        </div>
                      </div>

                      {/* Status and type */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${lead.type === 'Customer' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
                          {lead.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${lead.status === 'Initial Contact' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'Assessment' ? 'bg-purple-100 text-purple-800' :
                            lead.status === 'Documentation' ? 'bg-yellow-100 text-yellow-800' :
                              lead.status === 'Visa Processing' ? 'bg-green-100 text-green-800' :
                                lead.status === 'Offer Received' ? 'bg-teal-100 text-teal-800' :
                                  lead.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                                    'bg-red-100 text-red-800'}`}>
                          {lead.status}
                        </span>
                      </div>

                      {/* Footer with assigned and actions */}
                      <div className="flex flex-col justify-center items-center gap-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          <div>Assigned: {lead.assigned}</div>
                          <div>Last contact: {lead.lastContact}</div>
                        </div>
                        <div className="flex">
                          <button
                            onClick={() => handleLeadClick(lead.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentLead(lead);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
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
      </div>
      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        onSave={handleAddLead}
      />

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveLead}
        lead={currentLead}
      />
    </motion.div>
  );
};

export default LeadsPage;