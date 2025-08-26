import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const IMAGE_BASE_URL = 'http://localhost:5000/uploads/';

const UsedBikes = () => {
  const [usedBikes, setUsedBikes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/bikes')
      .then(res => {
        const filtered = res.data.filter(bike => bike.condition === 'used');
        setUsedBikes(filtered);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Browse Used Motorbikes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {usedBikes.map(bike => (
          <div key={bike._id} className="bg-white rounded shadow-md overflow-hidden border">
            <div className="aspect-w-1 aspect-h-1">
              {bike.images && bike.images.length > 0 ? (
                <img
                  src={`${IMAGE_BASE_URL}${bike.images[0]}`}
                  alt={`${bike.make} ${bike.model}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{bike.make} {bike.model}</h3>
              <p className="text-gray-600">Rs. {bike.price.toLocaleString()}</p>
              <Link to={`/bike/${bike._id}`} className="text-blue-500 text-sm hover:underline">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsedBikes;
