import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Mail, Phone, MapPin, ChevronDown, Globe, Home, FileText, ScrollText } from 'lucide-react';
import { useState, useEffect } from 'react';

const EditClientModal = ({ isOpen, onClose, onSave, client }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Customer',
    profession: '',
    country: 'Canada',
    email: '',
    phone: '',
    location: '',
    visaStatus: 'PR Processing',
    applications: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Populate form when client prop changes
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        type: client.type || 'Customer',
        profession: client.profession || '',
        country: client.country || 'Canada',
        email: client.email || '',
        phone: client.phone || '',
        location: client.location || '',
        visaStatus: client.visaStatus || 'PR Processing',
        applications: client.applications || '',
        notes: client.notes || ''
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.profession.trim()) newErrors.profession = 'Profession is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const updatedClient = {
        ...client,
        ...formData,
        lastActivity: new Date().toISOString().split('T')[0]
      };
      onSave(updatedClient);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const typeOptions = ['Customer', 'Agent'];
  const countryOptions = ['Canada', 'USA', 'UK', 'Australia', 'New Zealand', 'Germany', 'UAE'];
  const visaStatusOptions = ['PR Processing', 'PR Approved', 'Work Visa', 'Assessment', 'Visa Expired'];

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const inputHoverVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    focus: { scale: 1.03 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{
            background: 'rgba(27, 56, 144, 0.1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div 
                className="absolute inset-0 bg-gradient-to-br from-[#1B3890]/20 via-[#0F79C5]/10 to-transparent backdrop-blur-md" 
                onClick={onClose}
              />
            </motion.div>

            {/* Modal container */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="inline-block align-bottom bg-white/95 backdrop-blur-xl rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                boxShadow: '0 25px 50px -12px rgba(27, 56, 144, 0.25)'
              }}
            >
              <div className="relative p-8">
                {/* Decorative gradient border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-primary">
                  <div className="h-full w-full rounded-3xl bg-white/95 backdrop-blur-xl" />
                </div>
                
                <div className="relative z-10">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-between items-start mb-8"
                  >
                    <div className="space-y-1">
                      <motion.h2 
                        className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Edit Client
                      </motion.h2>
                      <motion.p 
                        className="text-muted-dark text-md"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Update details for {client?.name || 'this client'}
                      </motion.p>
                    </div>
                    <motion.button
                      onClick={onClose}
                      className="p-3 rounded-2xl hover:bg-red-50 transition-all duration-100 group cursor-pointer"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <X className="h-6 w-6 text-gray-600 group-hover:text-red-600 transition-colors duration-100" />
                    </motion.button>
                  </motion.div>

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Personal Information Section */}
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="relative">
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Full Name *
                            </label>
                            <motion.div 
                              className="relative"
                              variants={inputHoverVariants}
                              initial="rest"
                              whileHover="hover"
                              animate={focusedField === 'name' ? 'focus' : 'rest'}
                            >
                              <motion.div 
                                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"                         
                              >
                                <User className="h-5 w-5 text-[var(--color-secondary)] z-1" />
                              </motion.div>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                className={`pl-12 w-full py-3 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                  errors.name 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                    : 'border-gray-200 focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)]/20'
                                } focus:ring-4 focus:outline-none placeholder-gray-400`}
                                placeholder="James Wilson"
                              />
                            </motion.div>
                            <AnimatePresence>
                              {errors.name && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-2 text-sm text-red-600 font-medium"
                                >
                                  {errors.name}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email *
                            </label>
                            <motion.div 
                              className="relative"
                              variants={inputHoverVariants}
                              initial="rest"
                              whileHover="hover"
                              animate={focusedField === 'email' ? 'focus' : 'rest'}
                            >
                              <motion.div 
                                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                              >
                                <Mail className="h-5 w-5 text-[var(--color-secondary)] z-1" />
                              </motion.div>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                className={`pl-12 w-full py-3 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                  errors.email 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                    : 'border-gray-200 focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)]/20'
                                } focus:ring-4 focus:outline-none placeholder-gray-400`}
                                placeholder="james@example.com"
                              />
                            </motion.div>
                            <AnimatePresence>
                              {errors.email && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-2 text-sm text-red-600 font-medium"
                                >
                                  {errors.email}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phone *
                            </label>
                            <motion.div 
                              className="relative"
                              variants={inputHoverVariants}
                              initial="rest"
                              whileHover="hover"
                              animate={focusedField === 'phone' ? 'focus' : 'rest'}
                            >
                              <motion.div 
                                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                              >
                                <Phone className="h-5 w-5 text-[var(--color-secondary)] z-1" />
                              </motion.div>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                                className={`pl-12 w-full py-3 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                  errors.phone 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                    : 'border-gray-200 focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)]/20'
                                } focus:ring-4 focus:outline-none placeholder-gray-400`}
                                placeholder="+1 (416) 123-4567"
                              />
                            </motion.div>
                            <AnimatePresence>
                              {errors.phone && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-2 text-sm text-red-600 font-medium"
                                >
                                  {errors.phone}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>

                      {/* Professional Information Section */}
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="relative">
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Profession *
                            </label>
                            <motion.div
                              variants={inputHoverVariants}
                              initial="rest"
                              whileHover="hover"
                              animate={focusedField === 'profession' ? 'focus' : 'rest'}
                            >
                              <input
                                type="text"
                                name="profession"
                                value={formData.profession}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('profession')}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full py-3 px-4 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                  errors.profession 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                    : 'border-gray-200 focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)]/20'
                                } focus:ring-4 focus:outline-none placeholder-gray-400`}
                                placeholder="Software Engineer"
                              />
                            </motion.div>
                            <AnimatePresence>
                              {errors.profession && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-2 text-sm text-red-600 font-medium"
                                >
                                  {errors.profession}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Client Type
                          </label>
                          <motion.div 
                            className="relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <select
                              name="type"
                              value={formData.type}
                              onChange={handleChange}
                              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                            >
                              {typeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <motion.div 
                              className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
                              animate={{ rotate: focusedField === 'type' ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="h-5 w-5 text-[var(--color-secondary)]" />
                            </motion.div>
                          </motion.div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Visa Status
                            </label>
                            <motion.div 
                              className="relative"
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <select
                                name="visaStatus"
                                value={formData.visaStatus}
                                onChange={handleChange}
                                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                              >
                                {visaStatusOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-[var(--color-secondary)]" />
                              </div>
                            </motion.div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Country
                            </label>
                            <motion.div 
                              className="relative"
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                              >
                                {countryOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-[var(--color-secondary)]" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Full width fields */}
                      <motion.div 
                        className="lg:col-span-2 space-y-4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="relative">
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Location
                            </label>
                            <motion.div 
                              className="relative"
                              variants={inputHoverVariants}
                              initial="rest"
                              whileHover="hover"
                              animate={focusedField === 'location' ? 'focus' : 'rest'}
                            >
                              <motion.div 
                                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                              >
                                <MapPin className="h-5 w-5 text-[var(--color-secondary)] z-1" />
                              </motion.div>
                              <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('location')}
                                onBlur={() => setFocusedField(null)}
                                className="pl-12 w-full py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/20 focus:outline-none bg-white/80 backdrop-blur-sm transition-all duration-300 placeholder-gray-400"
                                placeholder="Toronto, ON"
                              />
                            </motion.div>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Active Applications
                            </label>
                            <motion.div 
                              className="relative"
                              variants={inputHoverVariants}
                              initial="rest"
                              whileHover="hover"
                              animate={focusedField === 'applications' ? 'focus' : 'rest'}
                            >
                              <motion.div 
                                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                              >
                                <ScrollText className="h-5 w-5 text-[var(--color-secondary)] z-1" />
                              </motion.div>
                              <input
                                type="number"
                                name="applications"
                                value={formData.applications}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('applications')}
                                onBlur={() => setFocusedField(null)}
                                className="pl-12 w-full py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/20 focus:outline-none bg-white/80 backdrop-blur-sm transition-all duration-300 placeholder-gray-400"
                                placeholder="3"
                                min="0"
                              />
                            </motion.div>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Notes
                            </label>
                            <motion.textarea
                              name="notes"
                              value={formData.notes}
                              onChange={handleChange}
                              onFocus={() => setFocusedField('notes')}
                              onBlur={() => setFocusedField(null)}
                              rows={4}
                              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/20 focus:outline-none bg-white/80 backdrop-blur-sm transition-all duration-300 placeholder-gray-400 resize-none"
                              placeholder="Any additional notes about this client's migration process..."
                              whileHover={{ scale: 1.01 }}
                              animate={focusedField === 'notes' ? { scale: 1.02 } : { scale: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Form actions */}
                    <motion.div 
                      className="mt-8 flex justify-end gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <motion.button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group cursor-pointer"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 20px 40px rgba(15, 121, 197, 0.2)'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10 flex items-center justify-center">
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                              />
                              Saving...
                            </>
                          ) : (
                            'Update'
                          )}
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditClientModal;