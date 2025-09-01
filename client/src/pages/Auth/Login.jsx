import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, X } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate("/bikes");
    } catch (err) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 right-20 w-32 h-32 rounded-full opacity-10 blur-2xl"
          style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
        />
        <div
          className="absolute bottom-20 left-20 w-24 h-24 rounded-full opacity-10 blur-2xl"
          style={{ background: "linear-gradient(90deg, #0F79C5, #1B3890)" }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden relative p-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-1 right-1 lg:top-3 lg:right-3 p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>

            <motion.div
              className="h-1 w-24 rounded-full mx-auto mt-3"
              style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            <p className="text-muted-dark mt-4">
              Please enter your details to access your account
            </p>
          </motion.div>

          {error && (
            <motion.div 
              variants={itemVariants}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <motion.div variants={itemVariants}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-primary)]" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-primary)]" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </motion.div>

            {/* Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                className="w-full cursor-pointer bg-gradient-primary text-white py-3 px-6 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2 group relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <div className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <LogIn className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Processing...' : 'Login'}</span>
                </div>
                {!loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-muted-dark">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              Sign up
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;