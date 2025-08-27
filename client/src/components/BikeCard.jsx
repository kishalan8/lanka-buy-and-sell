import { m as motion } from 'framer-motion';
import { useState } from 'react';
import { Heart, MapPin, Coins, Info, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const IMAGE_BASE_URL = 'http://localhost:5000/uploads/';

const BikeCard = ({ bike }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      // you can replace this with an API call if needed
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-300/50 hover-glow transition-all duration-300 group flex flex-col relative"
      whileHover={{ y: -8 }}
    >
      {/* Save button */}
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

      {/* Image Section */}
      <div className="relative h-52 w-full overflow-hidden">
        {bike.images && bike.images.length > 0 ? (
          <img
            src={`${IMAGE_BASE_URL}${bike.images[0]}`}
            alt={`${bike.make} ${bike.model}`}
            className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
            bike.condition === 'used' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {bike.condition}
        </span>
      </div>

      {/* Info Section */}
      <motion.div className="p-6 relative overflow-hidden flex-grow">
        <div className="relative z-10 h-full flex flex-col">
          <div className="mb-4">
            <motion.h3 className="text-lg font-bold text-gray-800 group-hover:text-[var(--color-secondary)] transition-colors duration-300">
              {bike.make} {bike.model}
            </motion.h3>
            <motion.p
              whileHover={{ scale: 1.05 }}
              className="mt-2 text-sm text-gray-600 font-medium bg-gray-50 inline-block px-3 py-1 rounded-lg group-hover:bg-blue-50 transition-colors duration-300"
            >
              Rs. {bike.price.toLocaleString()}
            </motion.p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-3 text-gray-600 mb-4">
            {bike.location && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-50 transition-colors duration-300"
              >
                <MapPin className="w-4 h-4 text-[var(--color-secondary)]" />
                <span className="font-medium text-sm">{bike.location}</span>
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-green-50 transition-colors duration-300"
            >
              <Coins className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-600 text-sm">
                Rs. {bike.price.toLocaleString()}
              </span>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-4 flex gap-3">
            <Link
              to={`/bike/${bike._id}`}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover-glow transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              <Info className="w-4 h-4" />
              View Details
            </Link>

            <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover-glow transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Apply
                </motion.button>
          </div>

          {/* Saved indicator */}
          {isSaved && (
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

export default BikeCard;
