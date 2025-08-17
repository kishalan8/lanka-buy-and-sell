import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Briefcase,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchSavedJobs();
    fetchWishlistStats();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [savedJobs, searchTerm, filterType]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/wishlist');
      if (data.success) {
        setSavedJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistStats = async () => {
    try {
      const { data } = await axios.get('/api/wishlist/stats');
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist stats:', error);
    }
  };

  const filterJobs = () => {
    let filtered = savedJobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.job.type === filterType);
    }

    setFilteredJobs(filtered);
  };

  const handleRemoveJob = async (jobId) => {
    try {
      await axios.delete(`/api/wishlist/${jobId}`);
      setSavedJobs(prev => prev.filter(item => item.job._id !== jobId));
      await fetchWishlistStats(); // Refresh stats
    } catch (error) {
      console.error('Error removing job from wishlist:', error);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const getJobTypes = () => {
    const types = savedJobs.map(item => item.job.type);
    return [...new Set(types)];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved jobs...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">Saved Jobs</h1>
          <p className="text-gray-600 mt-2">
            Manage your bookmarked job opportunities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSaved || 0}</div>
            <div className="text-sm text-gray-600">Total Saved</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{stats.expiringThisWeek || 0}</div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search saved jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Types</option>
              {getJobTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm || filterType !== 'all' ? 'No matching jobs found' : 'No saved jobs yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start saving jobs you\'re interested in to see them here'
            }
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((item, index) => (
            <motion.div
              key={item.job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {item.job.title}
                      </h3>
                      <p className="text-gray-600 font-medium">{item.job.company}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.job.type === 'Full-time' 
                        ? 'bg-green-100 text-green-700'
                        : item.job.type === 'Part-time'
                        ? 'bg-blue-100 text-blue-700'
                        : item.job.type === 'Contract'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {item.job.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{item.job.location}, {item.job.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>${item.job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Saved {formatDate(item.savedAt)}</span>
                    </div>
                  </div>

                  {/* Job Description Preview */}
                  {item.job.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {item.job.description.length > 150 
                        ? `${item.job.description.substring(0, 150)}...` 
                        : item.job.description
                      }
                    </p>
                  )}

                  {/* Expiring Warning */}
                  {item.job.expiringAt && (
                    (() => {
                      const daysUntilExpiry = Math.ceil(
                        (new Date(item.job.expiringAt) - new Date()) / (1000 * 60 * 60 * 24)
                      );
                      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
                        return (
                          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg mb-4">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => handleViewJob(item.job._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Job
                  </button>
                  <button
                    onClick={() => handleRemoveJob(item.job._id)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;