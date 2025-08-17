import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  MapPin,
  Coins,
  Filter,
  Search,
  X,
  CheckCircle,
  FileText,
  Send
} from 'lucide-react';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';

const JobListingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchJobs = async (filters = {}) => {
    try {
      setLoading(true);
      const { country, type, search } = filters;
      const params = new URLSearchParams();

      if (country && country !== 'Country') params.append('country', country);
      if (type && type !== 'Job') params.append('type', type);
      if (search) params.append('search', search);

      const response = await axios.get(`/api/jobs?${params.toString()}`);
      setJobs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApplyNow = (job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleFilter = (filters) => {
    fetchJobs(filters);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-soft relative overflow-hidden flex justify-center items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-full blur-3xl" />
        </div>
        <motion.div 
          className="text-center py-20 text-2xl font-semibold text-gray-700 relative z-10"
          variants={itemVariants}
        >
          Loading jobs...
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-soft relative overflow-hidden flex justify-center items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-full blur-3xl" />
        </div>
        <motion.div 
          className="flex justify-center items-center min-h-[40vh] text-red-500 text-lg font-semibold relative z-10"
          variants={itemVariants}
        >
          {error}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Mobile filters button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          className="p-4 bg-gradient-primary text-white rounded-full shadow-xl hover-glow transition-all duration-300"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <motion.div
            animate={{ rotate: mobileFiltersOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Filter className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </div>

      {/* Mobile filters overlay */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm z-50 bg-white p-6 overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-description-lg font-bold text-gray-800">Filter Jobs</h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </motion.button>
              </div>

              <JobFilters 
                onFilter={(filters) => {
                  handleFilter(filters);
                  setMobileFiltersOpen(false);
                }} 
                mobileView={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container-global mx-auto px-4 sm:px-0 py-8 lg:pt-12">
        {/* Header */}
        <div className="text-center bg-white rounded-3xl mb-12 bg-gradient-soft">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="p-10 rounded-3xl mb-8 shadow-2xl hover-glow"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 opacity-20"></div>
              <h1 className="text-2xl md:text-5xl font-bold md:pb-5 mb-4 relative z-10 
               bg-gradient-primary
               bg-clip-text text-transparent">
                Global Career Opportunities
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-description-sm text-muted-dark max-w-3xl mx-auto"
            >
              Discover premium international job opportunities in the world's most sought-after destinations
            </motion.p>
          </motion.div>
        </div>

        {/* Desktop Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="hidden md:block mb-8"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover-glow transition-all duration-300">
            <JobFilters onFilter={handleFilter} />
          </div>
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 text-gray-600 text-lg"
        >
          <span className="font-semibold text-gray-800">
            Showing {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </span>
        </motion.div>

        {/* Job Listings Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <motion.div
                key={job._id}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <JobCard 
                  job={job} 
                  onApply={handleApplyNow}
                  onViewDetails={() => navigate(`/jobs/${job._id}`)}
                />
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center text-gray-500 text-lg border border-white/20 col-span-3"
              variants={itemVariants}
            >
              No jobs found matching your criteria.
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* {isApplyModalOpen && (
        <ApplicationForm
          job={selectedJob}
          onClose={() => setIsApplyModalOpen(false)}
          onSubmit={() => {
            setIsApplyModalOpen(false);
          }}
        />
      )} */}
    </div>
  );
};

export default JobListingPage;