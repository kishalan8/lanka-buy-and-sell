import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";

const CustomSelect = ({ value, onChange, options, placeholder, name }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue) => {
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
        <span className="text-gray-700">{value ? options.find(o => o.value === value)?.label : placeholder}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
            {[{ label: placeholder, value: "" }, ...options].map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={() => handleSelect(option.value)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 text-gray-700 border-b border-gray-100 last:border-b-0 cursor-pointer"
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BikeFilters = ({ onFilter, mobileView = false }) => {
  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    condition: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = { search: "", brand: "", condition: "" };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  const brandOptions = [
    { label: "Honda", value: "honda" },
    { label: "Yamaha", value: "yamaha" },
    { label: "Suzuki", value: "suzuki" },
    { label: "KTM", value: "ktm" },
    { label: "Bajaj", value: "bajaj" },
    { label: "Hero Honda", value: "herohonda" }
  ];

  const conditionOptions = [
    { label: "Used", value: "used" },
    { label: "New", value: "new" }
  ];

  if (mobileView) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Model or keyword..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-300 hover:border-[var(--color-secondary)]"
            />
          </div>
        </motion.div>

        {/* Brand */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
          <CustomSelect
            name="brand"
            value={filters.brand}
            onChange={handleChange}
            options={brandOptions}
            placeholder="Brand"
          />
        </motion.div>

        {/* Condition */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
          <CustomSelect
            name="condition"
            value={filters.condition}
            onChange={handleChange}
            options={conditionOptions}
            placeholder="Condition"
          />
        </motion.div>

        {/* Buttons */}
        <div className="flex gap-3">
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-gradient-primary text-white rounded-lg font-medium hover-glow transition-all duration-300">
            Apply Filters
          </motion.button>
          <motion.button type="button" onClick={handleReset} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-300 hover:bg-gray-200">
            Reset
          </motion.button>
        </div>
      </form>
    );
  }

  // Desktop view
  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4 w-full">
      {/* Search */}
      <div className="flex-1 w-full relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors duration-300" />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search bikes (model, keywords)..."
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-300 hover:border-[var(--color-secondary)] text-description-sm"
        />
      </div>

      {/* Brand */}
      <CustomSelect
        name="brand"
        value={filters.brand}
        onChange={handleChange}
        options={brandOptions}
        placeholder="Brand"
      />

      {/* Condition */}
      <CustomSelect
        name="condition"
        value={filters.condition}
        onChange={handleChange}
        options={conditionOptions}
        placeholder="Condition"
      />

      {/* Buttons */}
      <div className="flex gap-3 w-full md:w-auto">
        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto px-6 py-4 bg-gradient-primary text-white rounded-xl font-semibold hover-glow transition-all duration-300">
          Filter
        </motion.button>
        <motion.button type="button" onClick={handleReset} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-200">
          Reset
        </motion.button>
      </div>
    </form>
  );
};

export default BikeFilters;
