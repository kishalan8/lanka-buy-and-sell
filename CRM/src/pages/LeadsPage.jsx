import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Edit2, Eye, User, Briefcase, Mail, Phone
} from 'lucide-react';

const LeadsPage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ status: '', assignedTo: '', priority: '' });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let mounted = true;
    setLoading(true);

    // Fetch users
    axios.get(`http://localhost:5000/api/users/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (mounted) setUsers(Array.isArray(res.data) ? res.data : []); })
      .catch(err => { if (mounted) setError('Failed to load users'); })
      .finally(() => { if (mounted) setLoading(false); });

    // Fetch admins
    axios.get("http://localhost:5000/api/admins", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setAdmins(res.data))
      .catch(err => console.error(err));

    return () => { mounted = false; };
  }, []);

  // Transform users into leads
  const leads = users.map(user => ({
    id: user._id || user.id,
    name: user.fullname || `${user.firstname || ''} ${user.lastname || ''}`.trim(),
    type: user.userType === 'agent' ? 'Agent' : 'Candidate',
    email: user.email || 'N/A',
    status: user.status || 'New Application',
    visaStatus: user.visaStatus || '',
    assigned: typeof user.assignedTo === 'object' ? user.assignedTo.name : (user.assignedTo || 'Unassigned'),
    phone: user.phoneNumber || 'N/A',
    profession: user.skills?.join(', ') || user.companyName || 'N/A',
    priority: user.priority || 'Low',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    raw: user
  }));

  // Filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesAssigned = assignedFilter === 'All' || lead.assigned === assignedFilter;
    return matchesSearch && matchesStatus && matchesAssigned;
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New Application': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Assessment': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Documentation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Visa Processing': return 'bg-green-100 text-green-800 border-green-200';
      case 'Offer Received': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisaStatusColor = (visaStatus) => {
    switch (visaStatus) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Not Started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Completed': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  

  // Navigate to lead detail page
  const handleView = (user) => {
    navigate(`/leads/${user._id}`);
  };

  // Edit user
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditData({
      visastatus: user.visaStatus || '',
      status: user.status || 'New Application',
      assignedTo: typeof user.assignedTo === 'object' ? user.assignedTo._id : (user.assignedTo || ''),
      priority: user.priority || 'Low'
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/users/${selectedUser._id}/leadupdate`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, ...editData } : u));
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  if (loading) return <div className="text-center mt-20 text-blue-600 font-semibold">Loading leads...</div>;
  if (error) return <div className="text-center mt-20 text-red-600 font-semibold">{error}</div>;

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-8 p-4 md:p-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        />
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="All">All Status</option>
            <option value="New Application">New Application</option>
            <option value="Assessment">Assessment</option>
            <option value="Documentation">Documentation</option>
            <option value="Visa Processing">Visa Processing</option>
            <option value="Offer Received">Offer Received</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="All">All Assigned</option>
            {admins.map(admin => (
              <option key={admin._id} value={admin.fullname || admin.name}>{admin.fullname || admin.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {['Lead Information','Type','Profession','Status', 'Visa Status','Priority','Assigned','Last Contact','Actions'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedLeads.length > 0 ? paginatedLeads.map(lead => (
              <tr key={lead.id} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-100">
                <td className="px-5 py-4 flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${lead.type === 'Customer' ? 'bg-blue-100' : 'bg-indigo-100'}`}>
                    {lead.type === 'Customer' ? <User className="h-5 w-5 text-blue-600" /> : <Briefcase className="h-5 w-5 text-indigo-600" />}
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-900">{lead.name}</div>
                    <div className="flex items-center space-x-2 text-xs text-muted-dark">
                      <Mail size={12} /><span>{lead.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-dark">
                      <Phone size={12} /><span>{lead.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs font-semibold">
                  <span className={`px-3 py-1 rounded-full border ${lead.type === 'Customer' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200'}`}>{lead.type}</span>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-700">{lead.profession}</td>
                <td className="px-4 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(lead.status)}`}>{lead.status}</span></td>
                <td className="px-4 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getVisaStatusColor(lead.visaStatus)}`}>{lead.visaStatus}</span></td>
                <td className="px-4 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(lead.priority)}`}>{lead.priority}</span></td>
                <td className="px-4 py-4 text-sm font-medium text-gray-700">{lead.assigned}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{lead.updatedAt?.split('T')[0]}</td>
                <td className="px-4 py-4 flex space-x-2">
                  <button onClick={() => handleView(lead.raw)} className="p-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-white"><Eye size={16} /></button>
                  <button onClick={() => handleEdit(lead.raw)} className="p-2 rounded-lg text-green-600 hover:text-green-800 hover:bg-white"><Edit2 size={16} /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="text-center py-12 text-gray-500">No leads found</td></tr>
            )}
          </tbody>
        </table>
      </div>

{/* Edit Modal */}
{showEditModal && selectedUser && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
      <h3 className="text-lg font-semibold mb-4">Edit {selectedUser.fullname || selectedUser.name}</h3>
      <div className="space-y-4">
        {/* Candidate: show all 4 fields, Agent: show only 2 fields */}
        {(selectedUser.userType !== 'agent') && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={editData.status}
                onChange={e => setEditData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="New Application">New Application</option>
                <option value="Assessment">Assessment</option>
                <option value="Documentation">Documentation</option>
                <option value="Visa Processing">Visa Processing</option>
                <option value="Offer Received">Offer Received</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Visa Status</label>
              <select
                value={editData.visaStatus}
                onChange={e => setEditData(prev => ({ ...prev, visaStatus: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Approved">Approved</option>
                <option value="Processing">Processing</option>
                <option value="Not Started">Not Started</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </>
        )}

        {/* Priority & Assigned for all */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
          <select
            value={editData.priority}
            onChange={e => setEditData(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>
          <select
            value={editData.assignedTo}
            onChange={e => setEditData(prev => ({ ...prev, assignedTo: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Unassigned</option>
            {admins.map(admin => (
              <option key={admin._id} value={admin._id}>{admin.fullname || admin.name}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </motion.div>
  );
};

export default LeadsPage;
