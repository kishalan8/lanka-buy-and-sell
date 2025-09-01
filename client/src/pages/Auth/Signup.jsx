import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const { signup, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  try {
    await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    navigate('/');
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-soft">
      <motion.div
        className="w-full max-w-lg lg:max-w-xl bg-white/50 border border-gray-200 rounded-3xl shadow-2xl backdrop-blur-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="p-8 lg:p-12">
          <div className="mb-8 text-center">
            <motion.h1 className="text-heading-lg text-gray-800">Create an Account</motion.h1>
            <motion.p className="text-muted-dark mt-2">Join us and find your next opportunity.</motion.p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <X className="h-5 w-5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Sign Up'} <UserPlus className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-dark">
            Already have an account? <Link to="/login" className="text-blue-700 font-medium hover:underline">Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
