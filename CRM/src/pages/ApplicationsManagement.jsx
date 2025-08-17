import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { admin } = useAuth();
  const socket = io('http://localhost:5000');

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/applications/all');
      setApplications(data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    socket.on('newApplication', fetchApplications); // Real-time updates
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    let filtered = applications;
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  const updateStatus = async (appId, newStatus) => {
    try {
      const { data } = await axios.put(`/api/applications/${appId}/status`, { status: newStatus });
      setApplications(prev => prev.map(app => app._id === appId ? data : app));
      toast.success('Status updated!');
      socket.emit('statusUpdate', data);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Track and update job applications in real-time.</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} className="flex gap-2 mt-2 md:mt-0">
          <RefreshCw className="w-6 h-6 cursor-pointer text-gray-500 hover:text-[var(--color-primary)]" onClick={fetchApplications} />
        </motion.div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by job or applicant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'Pending', 'In Review', 'Accepted', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                statusFilter === status ? 'bg-gradient-primary text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Applications List */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredApplications.length > 0 ? filteredApplications.map(app => (
            <motion.div
              key={app._id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between hover:shadow-xl transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{app.job.title}</h3>
                  <p className="text-gray-500 text-sm">{app.user.name}</p>
                </div>
                <div className="flex gap-2">
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600">Status:</span>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Review">In Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex items-center text-xs text-gray-500 gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Applied on: {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          )) : (
            <motion.div className="col-span-full text-center py-12 text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              No applications found
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ApplicationsManagement;
