import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

const ClientsFilters = ({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  countryFilter,
  setCountryFilter,
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl border border-white/20"
    >
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-full lg:max-w-5xl">
          <motion.div
            className="absolute inset-y-0 z-1 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"
            animate={{
              scale: searchQuery ? [1, 1.2, 1] : 1,
              color: searchQuery ? 'var(--color-secondary)' : '#6B7280'
            }}
            transition={{ duration: 0.3 }}
          >
            <Search size={18} className="sm:w-5 sm:h-5" />
          </motion.div>
          <input
            type="text"
            placeholder="Search clients by name or email..."
            className="pl-10 sm:pl-12 w-full p-3 border border-gray-200 rounded-xl focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md text-xs sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          {[
            { 
              label: 'Type', 
              value: typeFilter, 
              setter: setTypeFilter, 
              options: ['All', 'Customer', 'Agent'] 
            },
            { 
              label: 'Country', 
              value: countryFilter, 
              setter: setCountryFilter, 
              options: ['All', 'Canada', 'USA', 'UK', 'Australia', 'New Zealand', 'Germany', 'UAE'] 
            },
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
                className="appearance-none bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-8 sm:pr-10 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-all duration-300 hover:shadow-md cursor-pointer w-full text-xs sm:text-sm"
                value={filter.value}
                onChange={(e) => filter.setter(e.target.value)}
              >
                {filter.options.map(option => (
                  <option key={option} value={option}>
                    {option === 'All' ?
                      (filter.label === 'Country' ? 'All Countries' : `All ${filter.label}s`) :
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
  );
};

export default ClientsFilters;