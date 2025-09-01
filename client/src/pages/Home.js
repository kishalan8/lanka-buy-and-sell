import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const IMAGE_BASE_URL = 'http://localhost:5000';

const Home = () => {
  const [bikes, setBikes] = useState([]);
  const [sliderImages, setSliderImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch bikes and slider images
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bikesRes = await axios.get(`${IMAGE_BASE_URL}/api/bikes`);
        setBikes(bikesRes.data.slice().reverse().slice(0, 8));

        const sliderRes = await axios.get(`${IMAGE_BASE_URL}/api/slider-images/`);
        setSliderImages(sliderRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Auto-change slide every 4s
  useEffect(() => {
    if (!sliderImages.length) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderImages]);

  return (
    <div>
      {/* Slider */}
      {sliderImages.length > 0 && (
        <div className="relative w-full h-64 overflow-hidden">
          {sliderImages.map((slide, index) => (
            <img
              key={slide._id || index}
              src={`${IMAGE_BASE_URL}/${slide.imageUrl}`}
              alt={slide.caption || `Slide ${index + 1}`}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {/* Caption */}
          {sliderImages[currentSlide]?.caption && (
            <div className="absolute bottom-0 bg-black bg-opacity-50 text-white p-2 w-full text-center">
              {sliderImages[currentSlide].caption}
            </div>
          )}

          {/* Navigation dots */}
          <div className="absolute bottom-2 w-full flex justify-center gap-2">
            {sliderImages.map((_, index) => (
              <span
                key={index}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  index === currentSlide ? 'bg-white' : 'bg-gray-400'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Latest Bikes */}
      <section className="py-12 px-4">
        <h2 className="text-2xl font-semibold text-center mb-8">Latest Bikes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {bikes.map(bike => (
            <div key={bike._id} className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
              <div className="aspect-w-1 aspect-h-1">
                {bike.images?.[0] ? (
                  <img
                    src={`${IMAGE_BASE_URL}/uploads/${bike.images[0]}`}
                    alt={`${bike.make} ${bike.model}`}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold">{bike.make} {bike.model}</h3>
                <p className="text-gray-600 mb-2">
                  Rs. {bike.price ? bike.price.toLocaleString() : 'N/A'}
                </p>
                <Link to={`/bike/${bike._id}`} className="text-blue-500 text-sm hover:underline">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
