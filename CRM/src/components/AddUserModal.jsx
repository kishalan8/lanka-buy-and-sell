import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Lock, Eye, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

const AddUserModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Agent',
    status: 'Active',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
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
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) 
      newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) 
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newUser = {
        ...formData,
        id: Math.floor(Math.random() * 10000),
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      onSave(newUser);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const roleOptions = ['Admin', 'Sales', 'Agent'];
  const statusOptions = ['Active', 'Inactive'];

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
                        Add New User
                      </motion.h2>
                      <motion.p 
                        className="text-muted-dark text-md"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Create a new user account for your team
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
                                placeholder="John Smith"
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
                                placeholder="john@migrationco.com"
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
                                placeholder="+1 (555) 123-4567"
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

                      {/* Account Information Section */}
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Role *
                          </label>
                          <motion.div 
                            className="relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <select
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                            >
                              {roleOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <motion.div 
                              className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
                              animate={{ rotate: focusedField === 'role' ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="h-5 w-5 text-[var(--color-secondary)]" />
                            </motion.div>
                          </motion.div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status *
                          </label>
                          <motion.div 
                            className="relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                            >
                              {statusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                              <Check className="h-5 w-5 text-[var(--color-secondary)]" />
                            </div>
                          </motion.div>
                        </div>

                        <div className="relative">
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Password *
                            </label>
                            <motion.div 
                              className="relative"
                              variants={inputHoverVariants}
                              initial="rest"
                              whileHover="hover"
                              animate={focusedField === 'password' ? 'focus' : 'rest'}
                            >
                              <motion.div 
                                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                              >
                                <Lock className="h-5 w-5 text-[var(--color-secondary)] z-1" />
                              </motion.div>
                              <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className={`pl-12 w-full py-3 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                  errors.password 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                    : 'border-gray-200 focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)]/20'
                                } focus:ring-4 focus:outline-none placeholder-gray-400`}
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[var(--color-primary)]"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </motion.div>
                            <AnimatePresence>
                              {errors.password && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-2 text-sm text-red-600 font-medium"
                                >
                                  {errors.password}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Confirm Password *
                            </label>
                            <motion.div 
                              className="relative"
                              variants={inputHoverVariants}
                              initial="rest"
                              whileHover="hover"
                              animate={focusedField === 'confirmPassword' ? 'focus' : 'rest'}
                            >
                              <motion.div 
                                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                              >
                                <Lock className="h-5 w-5 text-[var(--color-secondary)] z-1" />
                              </motion.div>
                              <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('confirmPassword')}
                                onBlur={() => setFocusedField(null)}
                                className={`pl-12 w-full py-3 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                  errors.confirmPassword 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                    : 'border-gray-200 focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)]/20'
                                } focus:ring-4 focus:outline-none placeholder-gray-400`}
                                placeholder="••••••••"
                              />
                            </motion.div>
                            <AnimatePresence>
                              {errors.confirmPassword && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-2 text-sm text-red-600 font-medium"
                                >
                                  {errors.confirmPassword}
                                </motion.p>
                              )}
                            </AnimatePresence>
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
                              Creating...
                            </>
                          ) : (
                            'Create'
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

export default AddUserModal;