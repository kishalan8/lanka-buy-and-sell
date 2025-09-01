import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Coins, Info, Send } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const SavedBikes = () => {
  const token = localStorage.getItem("token");
  const [savedBikes, setSavedBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedBikes = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get("http://localhost:5000/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setSavedBikes(data.data);
        }
      } catch (err) {
        console.error("Error fetching saved bikes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedBikes();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved bikes...</p>
        </div>
      </div>
    );
  }

  if (savedBikes.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No saved bikes yet
        </h3>
        <p className="text-gray-500">
          Save bikes you're interested in to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedBikes.map((item, idx) => {
        const bike = item.bike;
        return (
          <motion.div
            key={bike._id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-300/50 hover-glow transition-all duration-300 group flex flex-col relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            {/* Image */}
            <div className="relative h-52 w-full overflow-hidden">
              {bike.images && bike.images.length > 0 ? (
                <img
                  src={bike.images[0]} // Cloudinary URL
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
                  bike.condition === "used" ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {bike.condition}
              </span>
            </div>

            {/* Info */}
            <motion.div className="p-6 relative overflow-hidden flex-grow">
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-4">
                  <motion.h3 className="text-lg font-bold text-gray-800 group-hover:text-[var(--color-secondary)] transition-colors duration-300">
                    {bike.make} {bike.model} ({bike.year})
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
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SavedBikes;
