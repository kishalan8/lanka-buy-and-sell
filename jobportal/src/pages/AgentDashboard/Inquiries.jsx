import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Search 
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import axios from 'axios'; // New: Added
import { io } from 'socket.io-client'; // New: Real-time
import { toast } from 'react-hot-toast'; // New: Messages
import { useAuth } from '../../context/AuthContext'; // New

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newInquiry, setNewInquiry] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const { user } = useAuth(); // New
  const socket = io('http://localhost:5000'); // New

  useEffect(() => {
    fetchInquiries();
    socket.on('inquiryResponse', (updatedInquiry) => { // New: Real-time
      setInquiries(prev => prev.map(inq => inq._id === updatedInquiry._id ? updatedInquiry : inq));
      toast.success('New response to your inquiry!');
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    let filtered = inquiries;
    if (searchTerm) {
      filtered = filtered.filter(inq => 
        inq.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inq => inq.status === statusFilter);
    }
    setFilteredInquiries(filtered);
  }, [inquiries, searchTerm, statusFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/agent/inquiries');
      if (data.success) {
        setInquiries(data.data);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    if (!newInquiry.trim()) return;
    try {
      const { data } = await axios.post('/api/agent/inquiries', { content: newInquiry });
      if (data.success) {
        setInquiries(prev => [data.inquiry, ...prev]);
        setNewInquiry('');
        toast.success('Inquiry sent successfully!');
      }
    } catch (error) {
      toast.error('Failed to send inquiry');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'In Review': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Closed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const InquiryCard = ({ inquiry }) => (
    <motion.div
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{inquiry.subject || 'Inquiry'}</h3>
            <p className="text-gray-600 mt-1 line-clamp-2">{inquiry.content}</p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {getStatusIcon(inquiry.status)}
            {inquiry.status}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          {formatDate(inquiry.createdAt)}
        </div>
        {inquiry.response && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Admin Response:</p>
            <p className="text-gray-600">{inquiry.response}</p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setSelectedInquiry(inquiry)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Full
          </button>
        </div>
      </div>
    </motion.div>
  );

  const InquiryDetailsModal = () => (
    <AnimatePresence>
      {selectedInquiry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInquiry(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Inquiry Details</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-gray-800">{selectedInquiry.subject || 'General Inquiry'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedInquiry.content}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {getStatusIcon(selectedInquiry.status)}
                  {selectedInquiry.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="text-gray-800">{formatDate(selectedInquiry.createdAt)}</p>
              </div>
              {selectedInquiry.response && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedInquiry.response}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Inquiries</h1>
          <p className="text-gray-600 mt-2">Create and track inquiries to admin</p>
        </div>
      </motion.div>

      {/* New Inquiry Form */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <form onSubmit={handleCreateInquiry} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter your inquiry..."
            value={newInquiry}
            onChange={(e) => setNewInquiry(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[200px]"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <button 
          onClick={fetchInquiries}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Inquiries List */}
      <div className="space-y-6">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Inquiries Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters.' 
                : 'No inquiries have been created yet.'}
            </p>
          </div>
        ) : (
          filteredInquiries.map((inquiry, index) => (
            <InquiryCard key={inquiry._id || index} inquiry={inquiry} />
          ))
        )}
      </div>

      {/* Inquiry Details Modal */}
      <InquiryDetailsModal />
    </div>
  );
};

export default Inquiries;