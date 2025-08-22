import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, ChevronDown, Edit2, Trash2, Eye, User, Briefcase, Filter, Mail, Phone, X, Save
} from 'lucide-react';

const ClientPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const admin = JSON.parse(localStorage.getItem("authUser"));
    if (!token || !admin) return;

    let mounted = true;
    setLoading(true);

    axios.get(`http://localhost:5000/api/users/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!mounted) return;
        setUsers(Array.isArray(res.data) ? res.data : []);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        if (mounted) setError('Failed to load users');
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  const leads = users.map(user => ({
    id: user._id || user.id || Math.random().toString(36).slice(2, 9),
    name: user.fullname || `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.name || 'Unknown',
    type: user.userType === 'agent' ? 'Agent' : 'Customer',
    email: user.email || 'N/A',
    status: user.status || 'New Lead',
    assigned: user.consultantName || user.assignedTo?.name || 'N/A',
    contact: user.email || 'N/A',
    phone: user.phoneNumber || user.phone || 'N/A',
    profession: user.skills?.join(', ') || user.companyName || 'N/A',
    priority: 'Low', // placeholder, can be updated based on business logic
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    raw: user
  }));

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.contact || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || lead.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesAssigned = assignedFilter === 'All' || lead.assigned === assignedFilter;
    return matchesSearch && matchesType && matchesStatus && matchesAssigned;
  });

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
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
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

  // View user
  const handleView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Edit user
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phone,
      status: user.status
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/users/${selectedUser.id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      // Update local state
      setUsers(prev => prev.map(u => u._id === selectedUser.id ? { ...u, ...editData } : u));
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 p-4 md:p-6">

      {/* Header and Search/Filters here (reuse your existing JSX) */}
      {/* ... code from parts 1 & 2 ... */}

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {['Lead Information','Type','Profession','Status','Priority','Assigned','Last Contact','Actions'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <AnimatePresence mode="wait">
              {paginatedLeads.length > 0 ? paginatedLeads.map((lead, index) => (
                <motion.tr key={lead.id} variants={tableRowVariants} initial="hidden" animate="visible" exit="exit" className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-100" onMouseEnter={() => setHoveredRow(lead.id)} onMouseLeave={() => setHoveredRow(null)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${lead.type === 'Customer' ? 'bg-blue-100' : 'bg-indigo-100'}`}>
                        {lead.type === 'Customer' ? <User className="h-5 w-5 text-blue-600" /> : <Briefcase className="h-5 w-5 text-indigo-600" />}
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-900">{lead.name}</div>
                        <div className="flex items-center space-x-2 text-xs text-muted-dark">
                          <Mail size={12} /><span>{lead.contact}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-dark">
                          <Phone size={12} /><span>{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full border ${lead.type === 'Customer' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200'}`}>{lead.type}</span></td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-700">{lead.profession}</td>
                  <td className="px-4 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full border ${lead.status === 'Initial Contact' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>{lead.status}</span></td>
                  <td className="px-4 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(lead.priority)}`}>{lead.priority}</span></td>
                  <td className="px-4 py-4"><span className="text-sm font-medium text-gray-700">{lead.assigned}</span></td>
                  <td className="px-4 py-4 text-sm text-gray-500">{lead.updatedAt?.split('T')[0]}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleView(lead.raw)} className="p-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-white"><Eye size={16} /></button>
                      <button onClick={() => handleEdit(lead.raw)} className="p-2 rounded-lg text-green-600 hover:text-green-800 hover:bg-white"><Edit2 size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No leads found</td></tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedUser && (
          <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl w-full max-w-lg p-6 relative" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-4">{selectedUser.name}</h3>
              <div className="space-y-2">
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
                <p><strong>Type:</strong> {selectedUser.userType}</p>
                <p><strong>Status:</strong> {selectedUser.status}</p>
                {selectedUser.userType === 'agent' && <p><strong>Company:</strong> {selectedUser.companyName}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl w-full max-w-lg p-6 relative" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-4">Edit {selectedUser.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input value={editData.name} onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input value={editData.email} onChange={e => setEditData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input value={editData.phoneNumber} onChange={e => setEditData(prev => ({ ...prev, phoneNumber: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={editData.status} onChange={e => setEditData(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                    <option value="New Lead">New Lead</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <button onClick={saveEdit} className="px-4 py-2 bg-gradient-primary text-white rounded-lg">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default ClientPage;
