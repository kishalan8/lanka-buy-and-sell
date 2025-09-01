import React, { useState } from 'react';
import axios from 'axios';

const SellBike = () => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    condition: '',
    description: '',
    sellerName: '',
    sellerPhone: '',   // ✅ Correct field
    sellerEmail: '',   // ✅ Correct field
  });

  const [images, setImages] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      images.forEach((img) => {
        data.append('images', img);
      });

      await axios.post('http://localhost:5000/api/submissions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMsg('Bike submitted successfully!');
      setFormData({
        make: '',
        model: '',
        year: '',
        price: '',
        condition: '',
        description: '',
        sellerName: '',
        sellerPhone: '',   // ✅ Reset
        sellerEmail: '',   // ✅ Reset
      });
      setImages([]);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit bike. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6">Sell Your Bike</h2>

      {successMsg && <p className="bg-green-100 text-green-800 p-3 rounded mb-4">{successMsg}</p>}
      {errorMsg && <p className="bg-red-100 text-red-800 p-3 rounded mb-4">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        {/* Bike Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Make</label>
            <input type="text" name="make" value={formData.make} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block font-medium mb-1">Model</label>
            <input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block font-medium mb-1">Year</label>
            <input type="number" name="year" min="1900" value={formData.year} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block font-medium mb-1">Expected Price (LKR)</label>
            <input type="number" name="price" min="0" value={formData.price} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Condition</label>
            <input type="text" name="condition" value={formData.condition} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full border px-3 py-2 rounded" />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block font-medium mb-1">Upload Images</label>
          <input type="file" name="images" multiple accept="image/*" onChange={handleImageChange} className="w-full border px-3 py-2 rounded" />
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {Array.from(images).map((img, idx) => (
                <img key={idx} src={URL.createObjectURL(img)} alt={`Preview ${idx}`} className="h-24 w-24 object-cover rounded border" />
              ))}
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Seller Name</label>
            <input type="text" name="sellerName" value={formData.sellerName} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block font-medium mb-1">Phone Number</label>
            <input
              type="text"
              name="sellerPhone" // ✅ Correct field
              value={formData.sellerPhone}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="sellerEmail" // ✅ Correct field
              value={formData.sellerEmail}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded">
            Submit Bike
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellBike;
