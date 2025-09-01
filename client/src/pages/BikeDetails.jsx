import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BikeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/bikes/${id}`);
        setBike(data.data); // backend returns { success, data }
        setSelectedImage(data.data.images?.[0] || '');
      } catch (err) {
        alert('Bike not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBike();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-center items-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-2xl font-semibold text-blue-600">Loading bike details...</p>
        </motion.div>
      </div>
    );

  if (!bike)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-gray-700 text-lg font-semibold">Bike not found</div>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="mb-8 group relative px-6 py-3 bg-white/80 backdrop-blur-md text-gray-700 rounded-2xl shadow-lg border border-white/20 flex items-center gap-3 overflow-hidden transition-all duration-300"
        >
          <span className="font-medium relative z-10">← Back to Bikes</span>
        </motion.button>

        {/* Bike Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

          <div className="px-8 py-8 md:px-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {bike.brand} {bike.model} ({bike.year})
                </h1>
                <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-semibold shadow-lg">
                  {bike.condition.charAt(0).toUpperCase() + bike.condition.slice(1)}
                </span>
              </div>
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-semibold shadow-lg">
                Rs. {bike.price.toLocaleString()}
              </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {bike.mileage !== undefined && bike.mileage !== null && (
                <motion.div
                  className="group bg-blue-50 p-3 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <p className="text-sm text-gray-500 mb-1">Mileage</p>
                  <p className="font-semibold text-gray-800">{bike.mileage} km/l</p>
                </motion.div>
              )}

              {bike.engineCapacity && (
                <motion.div
                  className="group bg-green-50 p-3 rounded-2xl border border-green-100 hover:border-green-200 transition-all duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <p className="text-sm text-gray-500 mb-1">Engine Capacity</p>
                  <p className="font-semibold text-green-800">{bike.engineCapacity} cc</p>
                </motion.div>
              )}

              {bike.stock && (
                <motion.div
                  className="group bg-yellow-50 p-3 rounded-2xl border border-yellow-100 hover:border-yellow-200 transition-all duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <p className="text-sm text-gray-500 mb-1">Stock</p>
                  <p className="font-semibold text-yellow-800">{bike.stock}</p>
                </motion.div>
              )}
            </div>

            {/* Images */}
            <div className="mb-6">
              {selectedImage ? (
                <img
                  src={selectedImage} // direct Cloudinary URL
                  alt={`${bike.brand} ${bike.model}`}
                  className="w-full h-auto max-h-[400px] object-cover rounded-xl mb-4"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-xl">
                  No Image Available
                </div>
              )}

              {bike.images && bike.images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {bike.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img} // direct Cloudinary URL
                      alt={`Thumbnail ${idx}`}
                      className={`h-20 w-32 object-cover border cursor-pointer rounded-xl ${
                        selectedImage === img ? 'border-blue-500' : 'border-gray-300'
                      }`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Description</h3>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {bike.description || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Documents */}
            {bike.documents && bike.documents.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Documents</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bike.documents.map((doc, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-100 p-3 rounded-xl text-gray-700 font-medium text-sm flex justify-between items-center"
                    >
                      <span>{doc.type}</span>
                      <a
                        href={doc.fileUrl} // direct Cloudinary URL
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BikeDetails;
