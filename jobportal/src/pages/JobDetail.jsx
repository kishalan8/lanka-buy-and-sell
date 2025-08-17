import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, Coins, ArrowLeft, CheckCircle, Send, Clock, Users, Star, Calendar, Building2, TrendingUp } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/jobs/${id}`);
        setJob(data);

        if (user) {
          const isApplied = data.applicants.some(
            (applicant) => applicant.userId === user._id
          );
          setApplied(isApplied);
        }

        setError(null);
      } catch (err) {
        setError('Failed to fetch job details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    try {
      await axios.post(`/api/jobs/${id}/apply`);
      console.log('Application submitted successfully');
      setApplied(true);
    } catch (err) {
      console.error(err);
      alert('Failed to apply for the job. Please try again.');
    }
  };

  // Add new states at the top of JobDetail
const [inquiry, setInquiry] = useState({
  email: user?.email || "",
  heading: "",
  subject: "",
  message: ""
});
const [inquirySent, setInquirySent] = useState(false);
const [inquiryError, setInquiryError] = useState("");

// Handle inquiry submit
const handleInquirySubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`/api/jobs/${id}/inquiry`, inquiry);
    setInquirySent(true);
    setInquiryError("");
  } catch (err) {
    console.error(err);
    setInquiryError(err.response?.data?.message || "Failed to send inquiry");
  }
};


  if (loading) return (
    <div className="min-h-screen bg-gradient-soft flex justify-center items-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-2xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
          Loading job details...
        </p>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-soft flex justify-center items-center">
      <motion.div
        className="text-center bg-white p-8 rounded-2xl shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-red-500 text-lg font-semibold">
          {error}
        </div>
      </motion.div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen bg-gradient-soft flex justify-center items-center">
      <motion.div
        className="text-center bg-white p-8 rounded-2xl shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-gray-700 text-lg font-semibold">
          Job not found
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft py-8 relative overflow-hidden">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="mb-8 group relative px-6 py-3 bg-white/80 backdrop-blur-md text-gray-700 rounded-2xl shadow-lg border border-white/20 flex items-center gap-3 overflow-hidden transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <motion.div
            whileHover={{ x: -3 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.div>
          <span className="font-medium relative z-10">Back to Jobs</span>
        </motion.button>

        {/* Main Job Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Gradient line */}
          <div className="h-1 bg-gradient-primary" />

          <div className="px-8 py-8 md:px-12">
            {/* Header Section */}
            <motion.div
              className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-3 mb-6">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h2 className="text-description-sm text-gray-600 font-semibold">{job.company}</h2>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className=""
              >
                <span className="inline-block px-8 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold shadow-lg transform hover:scale-105 transition-transform duration-200">
                  {job.type}
                </span>
              </motion.div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-200"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-800 text-md">{job.location}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group relative bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-2xl border border-green-100 hover:border-green-200 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Salary</p>
                    <p className="font-semibold text-green-700 text-md">{job.salary}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group relative bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-2xl border border-green-100 hover:border-green-200 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ExpiringAt</p>
                    <p className="font-semibold text-green-700 text-md">{new Date(job.expiringAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group relative bg-gradient-to-br from-purple-50 to-violet-50 p-3 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="font-semibold text-gray-800 text-md">{job.type}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group relative bg-gradient-to-br from-purple-50 to-violet-50 p-3 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Min Age Limit</p>
                    <p className="font-semibold text-gray-800 text-md">{job.ageLimit.min}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group relative bg-gradient-to-br from-purple-50 to-violet-50 p-3 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Max Age Limit</p>
                    <p className="font-semibold text-gray-800 text-md">{job.ageLimit.max}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Job Description */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-2 bg-gradient-primary rounded-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Briefcase className="w-5 h-5 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800">Job Description</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-description-sm">
                  {job.description}
                </p>
              </div>
            </motion.div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800">Requirements</h3>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                  <ul className="space-y-4">
                    {job.requirements.map((req, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-4 group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        </motion.div>
                        <span className="text-gray-700 text-description-sm group-hover:text-gray-800 transition-colors">
                          {req}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800">Skills</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {job.skills.map((skill, index) => (
                    <motion.span
                      key={index}
                      className="group relative bg-[var(--color-secondary)]/10 text-[var(--color-primary)] px-6 py-2 rounded-full text-description-sm font-medium shadow-md border border-blue-200 cursor-pointer overflow-hidden"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.05 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10">{skill}</span>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Job Description */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-2 bg-gradient-primary rounded-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Briefcase className="w-5 h-5 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800">Job Benefits</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-description-sm">
                  {job.benefits}
                </p>
              </div>
            </motion.div>

            {/* Application Section */}
            <motion.div
              className="pt-5 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              {user ? (
                <AnimatePresence mode="wait">
                  {applied ? (
                    <motion.div
                      className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 rounded-2xl border border-green-200"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6 }}
                      >
                        <CheckCircle className="w-8 h-8" />
                      </motion.div>
                      <div>
                        <p className="font-semibold text-lg">Application Submitted!</p>
                        <p className="text-green-600">We'll be in touch soon.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      onClick={handleApply}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative w-full md:w-auto px-6 py-3 bg-gradient-primary text-white rounded-2xl  text-description-sm font-semibold shadow-xl overflow-hidden transition-all duration-300 cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 flex items-center justify-center gap-4">
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Send className="w-5 h-5" />
                        </motion.div>
                        Apply Now
                      </div>

                    </motion.button>
                  )}
                </AnimatePresence>
              ) : (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                    <p className="text-gray-600 text-lg mb-4">
                      Ready to take the next step in your career?
                    </p>
                    <p className="text-gray-500">Please login to apply for this position</p>
                  </div>
                  <motion.button
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full md:w-auto mx-auto block px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xl shadow-xl overflow-hidden transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex items-center justify-center gap-4">
                      <TrendingUp className="w-6 h-6" />
                      Login to Apply
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Inquiry Section */}
<motion.div
  className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.2 }}
>
  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
    <Send className="w-5 h-5 text-blue-600" />
    Make an Inquiry
  </h3>

  {inquirySent ? (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
      Inquiry sent successfully! We'll get back to you soon.
    </div>
  ) : (
    <form onSubmit={handleInquirySubmit} className="space-y-4">
      {inquiryError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {inquiryError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={inquiry.email}
          onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
        <input
          type="text"
          value={inquiry.heading}
          onChange={(e) => setInquiry({ ...inquiry, heading: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          type="text"
          value={inquiry.subject}
          onChange={(e) => setInquiry({ ...inquiry, subject: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          rows="4"
          value={inquiry.message}
          onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg"
      >
        Send Inquiry
      </motion.button>
    </form>
  )}
</motion.div>

      </div>
    </div>
  );
};

export default JobDetail;