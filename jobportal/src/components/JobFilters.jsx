import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, MapPin, ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon, name }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    // Convert placeholder selection to empty string to match backend logic
    const selectedValue = option === placeholder ? '' : option;
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-300 hover:border-blue-300 bg-white text-left flex cursor-pointer items-center justify-between min-w-[140px] shadow-sm"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[var(--color-secondary)]" />}
          <span className="text-gray-700">{value || placeholder}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--color-primary)] rounded-xl shadow-lg z-[999] overflow-hidden"
          >
            {[placeholder, ...options].map((option) => (
              <motion.button
                key={option}
                type="button"
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 text-gray-700 border-b border-gray-100 last:border-b-0 cursor-pointer"
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JobFilters = ({ onFilter, mobileView = false }) => {
  const [filters, setFilters] = useState({
    country: '',
    type: '',
    search: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters); // passing filters to backnd
  };

  const handleReset = () => {
    setFilters({
      country: '',
      type: '',
      search: ''
    });
    onFilter({
      country: '',
      type: '',
      search: ''
    });
  };

  // Options for the dropdowns
  const countryOptions = ['USA', 'UK', 'Canada', 'Germany', 'Remote'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

  if (mobileView) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Job title or keywords..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-300 hover:border-[var(--color-secondary)]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <CustomSelect
            name="country"
            value={filters.country}
            onChange={handleChange}
            options={countryOptions}
            placeholder="Country"
            icon={MapPin}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type
          </label>
          <CustomSelect
            name="type"
            value={filters.type}
            onChange={handleChange}
            options={jobTypeOptions}
            placeholder="Job Type"
            icon={Briefcase}
          />
        </motion.div>

        <div className="flex gap-3">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-gradient-primary text-white rounded-lg font-medium hover-glow transition-all duration-300"
          >
            Apply Filters
          </motion.button>
          <motion.button
            type="button"
            onClick={handleReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-300 hover:bg-gray-200"
          >
            Reset
          </motion.button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4 w-full">
      {/* Search Input */}
      <div className="flex-1 w-full relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors duration-300" />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search jobs (title, company, etc.)..."
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-300 hover:border-[var(--color-secondary)] text-description-sm"
        />
      </div>

      {/* Country Select */}
      <CustomSelect
        name="country"
        value={filters.country}
        onChange={handleChange}
        options={countryOptions}
        placeholder="Country"
        icon={MapPin}
      />

      {/* Job Type Select */}
      <CustomSelect
        name="type"
        value={filters.type}
        onChange={handleChange}
        options={jobTypeOptions}
        placeholder="Job Type"
        icon={Briefcase}
      />

      {/* Buttons */}
      <div className="flex gap-3 w-full md:w-auto">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto px-6 py-4 bg-gradient-primary text-white rounded-xl font-semibold hover-glow transition-all duration-300"
        >
          Filter
        </motion.button>
        <motion.button
          type="button"
          onClick={handleReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-200"
        >
          Reset
        </motion.button>
      </div>
    </form>
  );
};

export default JobFilters;