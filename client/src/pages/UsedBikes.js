import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Filter, X } from 'lucide-react';
import BikeCard from '../components/BikeCard';
import BikeFilters from '../components/BikeFilters';

const UsedBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const navigate = useNavigate();

  const fetchBikes = async (filters = {}) => {
    try {
      setLoading(true);
      const { brand, condition, search } = filters;
      const params = new URLSearchParams();

      if (brand) params.append('brand', brand);
      if (condition) params.append('condition', condition);
      if (search) params.append('search', search);

      const response = await axios.get(`http://localhost:5000/api/bikes?${params.toString()}`);
      setBikes(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bikes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const handleFilter = (filters) => {
    fetchBikes(filters);
    setMobileFiltersOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen flex justify-center items-center bg-gray-50"
        initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants} className="text-gray-700 text-xl font-semibold">
          Loading bikes...
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div className="min-h-screen flex justify-center items-center bg-gray-50"
        initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants} className="text-red-500 text-lg font-semibold">
          {error}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Mobile Filters Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          className="p-4 bg-gradient-primary text-white rounded-full shadow-xl hover-glow transition-all duration-300"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <Filter className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Mobile Filters Overlay */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-sm z-50 bg-white p-6 overflow-y-auto shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Filter Bikes</h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </motion.button>
              </div>

              <BikeFilters onFilter={handleFilter} mobileView={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Filters */}
      <div className="container-global mx-auto px-4 sm:px-0 py-8 lg:pt-12">
        <div className="hidden md:block mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover-glow transition-all duration-300">
            <BikeFilters onFilter={handleFilter} />
          </div>
        </div>

        {/* Results Count */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6 text-gray-600 text-lg">
          <span className="font-semibold text-gray-800">
            Showing {bikes.length} {bikes.length === 1 ? 'bike' : 'bikes'}
          </span>
        </motion.div>

        {/* Bikes Grid */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" initial="hidden" animate="visible" variants={containerVariants}>
          {bikes.length > 0 ? (
            bikes.map((bike, index) => (
              <motion.div key={bike._id} variants={itemVariants} transition={{ delay: index * 0.05 }}>
                <BikeCard bike={bike} onViewDetails={() => navigate(`/bikes/${bike._id}`)} />
              </motion.div>
            ))
          ) : (
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center text-gray-500 text-lg border border-white/20 col-span-3"
              variants={itemVariants}
            >
              No bikes found matching your criteria.
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UsedBikes;
