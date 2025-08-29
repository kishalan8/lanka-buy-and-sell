import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, AtSign, Lock, User, Eye, EyeOff, CheckCircle, Check, ArrowDown, ChevronDown, Loader2 } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const floatingVariants = {
    animate: {
      y: [-20, 20, -20],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password}),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Store token and user info
      localStorage.setItem("token", data.token);

      // Redirect based on role
      if (data.user.role === "admin") {
        window.location.href = "/admin";
      } 
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans text-gray-800 relative overflow-hidden">

      {/* Left side: Hero section with logo and marketing message */}
      {/* <motion.div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950 text-white relative overflow-hidden"
        initial={{ x: "-100vw" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 50, duration: 1 }}
      >
        <div className="z-10 text-center space-y-4 max-w-lg">
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          >
            <img
              src="/blue-whale-logo.webp"
              alt="Blue Whale CRM Logo"
              className="w-auto h-20 mx-auto drop-shadow-2xl filter brightness-110"
            />
            <div
              className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h1 className="text-heading-lg tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
              Streamline Your Workflow
            </h1>
            <p className="text-description-sm text-muted-light leading-relaxed">
              A powerful CRM solution designed to help you manage leads, clients, and tasks with effortless precision.
            </p>
          </motion.div>

          <motion.div
            className="space-y-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            {[
              "Intuitive Lead Management",
              "Seamless Client Communication",
              "Efficient Task Automation"
            ].map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-white font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div> */}

      {/* Right side: Login form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-16 relative z-10">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile logo */}
          <motion.div variants={itemVariants} className="text-center mb-8 lg:hidden">
            <img
              src="/blue-whale-logo.webp"
              alt="Blue Whale CRM Logo"
              className="w-auto h-15 mx-auto mb-4"
            />
            <h1 className="text-heading-lg font-bold bg-gradient-primary bg-clip-text text-transparent pb-1">
              CRM Login
            </h1>
            <p className="text-muted-dark mt-2 font-medium">Sign in to your account</p>
          </motion.div>

          {/* Desktop header */}
          <motion.div variants={itemVariants} className="hidden lg:block text-center mb-10">
            <h1 className="text-heading-lg font-bold bg-gradient-primary bg-clip-text text-transparent pb-1">
              Welcome Back!
            </h1>
            <p className="text-muted-dark text-lg">Please sign in to continue</p>
          </motion.div>

          {/* Login form card */}
          <motion.form
            onSubmit={handleLogin}
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-muted-dark mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <AtSign className="w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-white/80 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-muted-dark mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-14 py-3 border border-gray-200 rounded-lg bg-white/80 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 py-3 px-6 bg-gradient-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-lg">Login</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;