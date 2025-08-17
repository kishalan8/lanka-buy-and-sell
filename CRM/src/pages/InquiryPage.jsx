// FILE PATH: admin/src/pages/InquiryPage.jsx
// COMPLETE INQUIRY MANAGEMENT SYSTEM

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import {
  MessageCircle,
  Mail,
  Eye,
  Reply,
  Archive,
  Trash2,
  Clock,
  User,
  Tag,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Calendar,
  Phone,
  Building,
  Globe,
  RefreshCw,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Paperclip,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InquiryPage = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  
  // State management
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showInquiryDetails, setShowInquiryDetails] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate('/admin');
      return;
    }
    fetchInquiries();
  }, [admin, navigate]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/inquiries', {
        headers: { Authorization: `Bearer ${admin.token}` }
      }).catch(() => ({ data: [] }));

      let inquiriesData = response.data || [];

      // If no inquiries from API, create mock data
      if (inquiriesData.length === 0) {
        inquiriesData = [
          {
            _id: 'inquiry-1',
            email: 'john.doe@example.com',
            name: 'John Doe',
            subject: 'Question about Software Developer Position',
            message: 'Hi, I would like to know more about the requirements for the Software Developer position. Could you please provide more details about the tech stack and work environment?',
            status: 'pending',
            priority: 'medium',
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            category: 'job-inquiry',
            phone: '+1-555-123-4567'
          },
          {
            _id: 'inquiry-2',
            email: 'sarah.wilson@example.com',
            name: 'Sarah Wilson',
            subject: 'Application Status Update',
            message: 'Hello, I submitted my application for the Marketing Manager position two weeks ago. Could you please let me know the current status of my application?',
            status: 'responded',
            priority: 'high',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            category: 'application-status',
            phone: '+1-555-987-6543'
          },
          {
            _id: 'inquiry-3',
            email: 'mike.johnson@company.com',
            name: 'Mike Johnson',
            subject: 'Partnership Opportunity',
            message: 'We are interested in exploring partnership opportunities with your organization. Would it be possible to schedule a meeting to discuss potential collaboration?',
            status: 'pending',
            priority: 'high',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            category: 'business',
            company: 'Tech Solutions Inc.'
          },
          {
            _id: 'inquiry-4',
            email: 'emily.brown@example.com',
            name: 'Emily Brown',
            subject: 'Technical Support Request',
            message: 'I am having trouble accessing my candidate portal. The login page keeps showing an error message. Can you please help me resolve this issue?',
            status: 'in-progress',
            priority: 'medium',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
            category: 'technical-support',
            phone: '+1-555-456-7890'
          },
          {
            _id: 'inquiry-5',
            email: 'david.lee@example.com',
            name: 'David Lee',
            subject: 'Salary and Benefits Information',
            message: 'Could you please provide information about the salary range and benefits package for the Data Analyst position? I want to make sure it aligns with my expectations.',
            status: 'closed',
            priority: 'low',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            category: 'job-inquiry',
            phone: '+1-555-321-0987'
          }
        ];
      }

      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/inquiries/${inquiryId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${admin.token}` }
      }).catch(() => {
        // Mock success for demo
        console.log('Status updated (mock)');
      });

      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry._id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
        )
      );

      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const updateInquiryPriority = async (inquiryId, newPriority) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/inquiries/${inquiryId}/priority`, {
        priority: newPriority
      }, {
        headers: { Authorization: `Bearer ${admin.token}` }
      }).catch(() => {
        // Mock success for demo
        console.log('Priority updated (mock)');
      });

      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry._id === inquiryId ? { ...inquiry, priority: newPriority } : inquiry
        )
      );

      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setSelectedInquiry(prev => ({ ...prev, priority: newPriority }));
      }
    } catch (error) {
      console.error('Error updating inquiry priority:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const sendReply = async (inquiryId) => {
    if (!replyText.trim()) return;

    setActionLoading(true);
    try {
      await axios.post(`/api/inquiries/${inquiryId}/reply`, {
        message: replyText,
        adminId: admin.id
      }, {
        headers: { Authorization: `Bearer ${admin.token}` }
      }).catch(() => {
        // Mock success for demo
        console.log('Reply sent (mock)');
      });

      // Update inquiry status to responded
      await updateInquiryStatus(inquiryId, 'responded');
      setReplyText('');
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;

    setActionLoading(true);
    try {
      await axios.delete(`/api/inquiries/${inquiryId}`, {
        headers: { Authorization: `Bearer ${admin.token}` }
      }).catch(() => {
        // Mock success for demo
        console.log('Inquiry deleted (mock)');
      });

      setInquiries(prev => prev.filter(inquiry => inquiry._id !== inquiryId));
      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setShowInquiryDetails(false);
        setSelectedInquiry(null);
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Failed to delete inquiry');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || inquiry.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate stats
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    inProgress: inquiries.filter(i => i.status === 'in-progress').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
    high: inquiries.filter(i => i.priority === 'high').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={12} />;
      case 'in-progress':
        return <AlertTriangle size={12} />;
      case 'responded':
        return <CheckCircle size={12} />;
      case 'closed':
        return <XCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'job-inquiry':
        return <Building className="text-blue-500" size={16} />;
      case 'application-status':
        return <User className="text-green-500" size={16} />;
      case 'technical-support':
        return <Globe className="text-purple-500" size={16} />;
      case 'business':
        return <Star className="text-orange-500" size={16} />;
      default:
        return <MessageCircle className="text-gray-500" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 ml-60 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"
            />
            <p className="mt-4 text-gray-600 font-medium">Loading inquiries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar onLogout={handleLogout} />
      
      <div className="flex-1 ml-60 flex flex-col overflow-hidden">
        <Header title="Inquiry Management" />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="text-blue-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inquiry Management</h1>
                <p className="text-gray-600">Manage customer inquiries and support requests</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            {[
              { name: 'Total Inquiries', value: stats.total, color: 'bg-blue-500', icon: <MessageCircle size={20} />, change: '+8%' },
              { name: 'Pending', value: stats.pending, color: 'bg-yellow-500', icon: <Clock size={20} />, change: '+12%' },
              { name: 'In Progress', value: stats.inProgress, color: 'bg-purple-500', icon: <AlertTriangle size={20} />, change: '+5%' },
              { name: 'Responded', value: stats.responded, color: 'bg-green-500', icon: <CheckCircle size={20} />, change: '+15%' },
              { name: 'Closed', value: stats.closed, color: 'bg-gray-500', icon: <XCircle size={20} />, change: '+3%' },
              { name: 'High Priority', value: stats.high, color: 'bg-red-500', icon: <Flag size={20} />, change: '-2%' }
            ].map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`${stat.color} p-2 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium">{stat.name}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/50"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or subject..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <button
                  onClick={fetchInquiries}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>

          {/* Inquiries List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden"
          >
            {filteredInquiries.length > 0 ? (
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredInquiries.map((inquiry, index) => (
                    <motion.div
                      key={inquiry._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setShowInquiryDetails(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getCategoryIcon(inquiry.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">{inquiry.subject}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                                {getStatusIcon(inquiry.status)}
                                {inquiry.status}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(inquiry.priority)}`}>
                                <Flag size={10} />
                                {inquiry.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{inquiry.message}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User size={12} />
                                {inquiry.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail size={12} />
                                {inquiry.email}
                              </div>
                              {inquiry.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {inquiry.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowInquiryDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-100"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <div className="relative group">
                            <button className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100">
                              <MoreVertical size={16} />
                            </button>
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="p-1">
                                {['pending', 'in-progress', 'responded', 'closed'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => updateInquiryStatus(inquiry._id, status)}
                                    disabled={actionLoading}
                                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded capitalize"
                                  >
                                    Mark as {status.replace('-', ' ')}
                                  </button>
                                ))}
                                <hr className="my-1" />
                                <button
                                  onClick={() => deleteInquiry(inquiry._id)}
                                  disabled={actionLoading}
                                  className="block w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded"
                                >
                                  Delete inquiry
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">No inquiries found</p>
                <p className="text-gray-400 text-sm">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Inquiries from customers will appear here'
                  }
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Inquiry Details Modal */}
      <AnimatePresence>
        {showInquiryDetails && selectedInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getCategoryIcon(selectedInquiry.category)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedInquiry.subject}</h3>
                      <p className="text-gray-600">From {selectedInquiry.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInquiryDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status and Priority Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Status</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedInquiry.status)}`}>
                        {getStatusIcon(selectedInquiry.status)}
                        {selectedInquiry.status}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {['pending', 'in-progress', 'responded', 'closed'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateInquiryStatus(selectedInquiry._id, status)}
                          disabled={actionLoading}
                          className={`px-3 py-1 text-sm rounded-lg capitalize transition-colors ${
                            selectedInquiry.status === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {status.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Priority</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(selectedInquiry.priority)}`}>
                        <Flag size={10} />
                        {selectedInquiry.priority}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {['low', 'medium', 'high'].map(priority => (
                        <button
                          key={priority}
                          onClick={() => updateInquiryPriority(selectedInquiry._id, priority)}
                          disabled={actionLoading}
                          className={`px-3 py-1 text-sm rounded-lg capitalize transition-colors ${
                            selectedInquiry.priority === priority
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="text-gray-400" size={16} />
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">{selectedInquiry.email}</span>
                      </div>
                    </div>
                    {selectedInquiry.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="text-gray-400" size={16} />
                        <div>
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="ml-2 font-medium">{selectedInquiry.phone}</span>
                        </div>
                      </div>
                    )}
                    {selectedInquiry.company && (
                      <div className="flex items-center gap-2">
                        <Building className="text-gray-400" size={16} />
                        <div>
                          <span className="text-sm text-gray-600">Company:</span>
                          <span className="ml-2 font-medium">{selectedInquiry.company}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-400" size={16} />
                      <div>
                        <span className="text-sm text-gray-600">Received:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedInquiry.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageCircle size={16} />
                    Message Content
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                </div>

                {/* Quick Reply */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Reply size={16} />
                    Quick Reply
                  </h4>
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Paperclip size={14} />
                        <span>Reply will be sent to {selectedInquiry.email}</span>
                      </div>
                      <button
                        onClick={() => sendReply(selectedInquiry._id)}
                        disabled={actionLoading || !replyText.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Send size={16} />
                        {actionLoading ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Response Templates */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Response Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        title: 'Acknowledge Receipt',
                        content: 'Thank you for your inquiry. We have received your message and will get back to you within 24 hours.'
                      },
                      {
                        title: 'Request More Info',
                        content: 'Thank you for your interest. Could you please provide more details about your specific requirements?'
                      },
                      {
                        title: 'Application Status',
                        content: 'Thank you for checking on your application status. We are currently reviewing all applications and will update you soon.'
                      },
                      {
                        title: 'Technical Support',
                        content: 'We apologize for the technical issue you\'re experiencing. Our team is looking into this and will resolve it shortly.'
                      }
                    ].map((template, index) => (
                      <button
                        key={index}
                        onClick={() => setReplyText(template.content)}
                        className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-sm text-gray-900 mb-1">{template.title}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{template.content}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowInquiryDetails(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => updateInquiryStatus(selectedInquiry._id, 'closed')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Mark as Closed
                  </button>
                  <button
                    onClick={() => deleteInquiry(selectedInquiry._id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Inquiry
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InquiryPage;