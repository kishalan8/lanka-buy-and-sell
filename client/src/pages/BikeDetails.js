import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const IMAGE_BASE_URL = 'http://localhost:5000/uploads/';

const BikeDetails = () => {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/bikes/${id}`)
      .then(res => {
        const data = res.data;
        setBike(data);
        setSelectedImage(data.images && data.images.length > 0 ? data.images[0] : '');
      })
      .catch(() => alert('Bike not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-12 text-lg">Loading...</div>;
  if (!bike) return <div className="text-center mt-12 text-red-500">Bike not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left side */}
        <div>
          <h2 className="text-3xl font-bold mb-2">{bike.make} {bike.model} ({bike.year})</h2>
          <div className="mb-4">
            {selectedImage ? (
              <img
                src={`${IMAGE_BASE_URL}${selectedImage}`}
                alt={`${bike.make} ${bike.model}`}
                className="w-full h-auto max-h-[400px] object-cover rounded"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {bike.images && bike.images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {bike.images.map((img, idx) => (
                <img
                  key={idx}
                  src={`${IMAGE_BASE_URL}${img}`}
                  alt={`Thumbnail ${idx}`}
                  className={`h-20 w-32 object-cover border cursor-pointer rounded ${selectedImage === img ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right side */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-6">
            {bike.description || 'No description available.'}
          </p>

          <h3 className="text-xl font-semibold">Price</h3>
          <p className="text-green-600 text-2xl font-bold mt-2">Rs. {bike.price.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default BikeDetails;
