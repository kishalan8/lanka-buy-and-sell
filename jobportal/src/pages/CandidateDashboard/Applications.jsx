import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, CheckCircle, AlertCircle, XCircle, ChevronRight, Calendar, Briefcase } from 'lucide-react';

const Applications = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch job details for each application
        const appsWithDetails = await Promise.all(
          res.data.appliedJobs.map(async (applied) => {
            try {
              const jobRes = await axios.get(`/api/jobs/${applied.jobId}`);
              console.log(jobRes)
              return {
                id: applied._id,
                jobId: applied.jobId,
                title: jobRes.data.title,
                company: jobRes.data.company || 'Company not specified',
                country: jobRes.data.location,
                status: applied.status,
                appliedDate: new Date(applied.appliedAt).toISOString().split('T')[0]
              };
            } catch (err) {
              console.error('Error fetching job details:', err);
              return null;
            }
          })
        );

        setApplications(appsWithDetails.filter(app => app !== null));
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Applied": return <AlertCircle className="w-4 h-4" />;
      case "Accepted": return <CheckCircle className="w-4 h-4" />;
      case "Rejected": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Applied": return "bg-gradient-to-r from-amber-400 to-orange-500 text-white";
      case "Accepted": return "bg-gradient-to-r from-emerald-400 to-green-500 text-white";
      case "Rejected": return "bg-gradient-to-r from-red-400 to-rose-500 text-white";
      default: return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
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

  const cardVariants = {
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


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold mt-10">
        {error}
      </div>
    );
  }

  if (!applications.length) {
    return (
      <div className="text-center text-gray-600 py-10">
        You haven't applied to any jobs yet.
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-heading-lg pb-3 font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent text-center md:text-left">
          My Applications
        </h1>
        <motion.div
          className="h-1 w-24 rounded-full mx-auto md:mx-0"
          style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.div>

      {/* Applications List */}
      <motion.div className="space-y-4 md:space-y-6">
        {applications.map((app) => (
          <motion.div
            key={app.id}
            variants={cardVariants}
            className="group relative"
            onHoverStart={() => setHoveredCard(app.id)}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <motion.div
              className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden relative"
              whileHover={{
                y: -5,
                boxShadow: "0 25px 50px -12px rgba(27, 56, 144, 0.15)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" />

              <motion.div className="relative p-5 md:p-6">
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    className={`px-4 py-2 rounded-full text-xs font-bold ${getStatusStyle(app.status)} flex items-center gap-2 shadow-md`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {getStatusIcon(app.status)}
                    {app.status}
                  </motion.div>
                </div>

                {/* Main content */}
                <div className="pr-10">
                  <motion.h3
                    className="text-lg font-bold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors duration-300"
                    whileHover={{ x: window.innerWidth > 768 ? 3 : 0 }}
                  >
                    {app.title}
                  </motion.h3>

                  <motion.p className="text-muted-dark font-medium text-md mb-3">
                    {app.company}
                  </motion.p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <motion.div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
                      <span>{app.country}</span>
                    </motion.div>
                    <motion.div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[var(--color-primary)]" />
                      <span>Applied {app.appliedDate}</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Applications;