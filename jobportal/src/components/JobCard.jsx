import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Coins,
  CheckCircle,
  FileText,
  Send,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JobCard = ({ job, onApply, onViewDetails }) => {
  const { user, loading, saveJob, unsaveJob, isJobSaved } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Helper function to check if user is candidate
  const isCandidate = user && user.userType === 'candidate';

  // Check if job is saved and applied on component mount
  useEffect(() => {
    const checkStatuses = async () => {
      if (isCandidate && job._id && !loading) {
        try {
          // Check if job is saved
          const saved = await isJobSaved(job._id);
          setIsSaved(saved);

          // Check if user has applied
          const applied = job.applicants?.some(
            (applicant) => applicant.userId === user._id
          );
          setIsApplied(applied);
        } catch (error) {
          console.error('Error checking job statuses:', error);
        }
      }
    };

    checkStatuses();
  }, [job._id, job.applicants, isCandidate, isJobSaved, user, loading]);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isCandidate) return;

    setIsLoading(true);
    try {
      if (isSaved) {
        await unsaveJob(job._id);
        setIsSaved(false);
      } else {
        await saveJob(job._id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling job save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-300/50 hover-glow transition-all duration-300 group flex flex-col relative"
      whileHover={{ y: -8 }}
    >
      {/* Save button for candidates */}
      {isCandidate && (
        <motion.button
          onClick={handleSaveToggle}
          disabled={isLoading}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-300 ${
            isSaved
              ? 'bg-red-100 text-red-500 hover:bg-red-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{ pointerEvents: 'auto' }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
          ) : isSaved ? (
            <Heart className="w-5 h-5 fill-current" />
          ) : (
            <Heart className="w-5 h-5" />
          )}
        </motion.button>
      )}

      <motion.div className="p-6 relative overflow-hidden flex-grow">
        {/* Hover background effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(45deg, rgba(15, 121, 197, 0.02), rgba(27, 56, 144, 0.02))'
          }}
        />

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-5">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="p-3 bg-gradient-primary rounded-xl text-white shadow-lg"
            >
              <Briefcase className="w-6 h-6" />
            </motion.div>
            <div className="flex-1">
              <motion.h3 className="text-xl font-bold text-gray-800 group-hover:text-[var(--color-secondary)] transition-colors duration-300 pr-12">
                {job.title}
              </motion.h3>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-block text-sm text-[var(--color-secondary)] bg-blue-50 px-3 py-1 rounded-full mt-2 font-medium"
              >
                {job.type}
              </motion.span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-3 text-gray-600 mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-50 transition-colors duration-300"
            >
              <MapPin className="w-4 h-4 text-[var(--color-secondary)]" />
              <span className="font-medium text-sm">{job.country}</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-green-50 transition-colors duration-300"
            >
              <Coins className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-600 text-sm">
                {job.salary}
              </span>
            </motion.div>
          </div>

          {/* Requirements preview */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Requirements:
              </h4>
              <ul className="space-y-2">
                {job.requirements.slice(0, 2).map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{req}</span>
                  </li>
                ))}
                {job.requirements.length > 2 && (
                  <li className="text-sm text-[var(--color-secondary)] font-medium">
                    +{job.requirements.length - 2} more requirements
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Buttons container */}
          <div className="mt-auto pt-4 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-2 bg-white border border-[var(--color-secondary)] text-[var(--color-secondary)] rounded-lg font-semibold text-sm hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              onClick={onViewDetails}
            >
              <FileText className="w-4 h-4" />
              View Details
            </motion.button>

            {/* Apply button or status */}
            {isCandidate &&
              (isApplied ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-semibold shadow-inner flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Applied
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover-glow transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  onClick={() => onApply && onApply(job)}
                >
                  <Send className="w-4 h-4" />
                  Apply
                </motion.button>
              ))}
          </div>

          {/* Save status indicator */}
          {isCandidate && isSaved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-2 left-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium z-10"
            >
              Saved
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JobCard;
