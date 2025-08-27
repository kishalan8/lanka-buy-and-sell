import React, { useEffect, useState } from 'react';
import axios from 'axios';

const IMAGE_BASE_URL = 'http://localhost:5000';

const AdminSlider = () => {
  const [sliderImages, setSliderImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");

  // Fetch current slider images
  useEffect(() => {
    axios.get(`${IMAGE_BASE_URL}/api/slider-images`)
      .then(res => setSliderImages(res.data))
      .catch(console.error);
  }, []);

  // Upload new slider images
  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Please select at least one image");

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("images", file)); // MUST be 'images'
    formData.append("caption", caption);

    try {
      await axios.post(`${IMAGE_BASE_URL}/api/slider-images/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Uploaded successfully");
      setCaption("");
      setFiles([]);
      // Refresh slider list
      const res = await axios.get(`${IMAGE_BASE_URL}/api/slider-images`);
      setSliderImages(res.data);
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err);
      alert("Upload failed. Check console for details.");
    }
  };

  // Delete image
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`${IMAGE_BASE_URL}/api/slider-images/${id}`);
      setSliderImages(sliderImages.filter(img => img._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Slider Images</h1>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-6">
        <input 
          type="file" 
          accept="image/*" 
          multiple
          onChange={e => setFiles(e.target.files)} 
          className="mb-2" 
        />
        <input 
          type="text" 
          placeholder="Caption (optional)" 
          value={caption} 
          onChange={e => setCaption(e.target.value)} 
          className="border p-2 mb-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Upload</button>
      </form>

      {/* Existing Slider Images */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sliderImages.map(img => (
          <div key={img._id} className="border p-2">
            <img src={`${IMAGE_BASE_URL}/${img.imageUrl}`} alt="" className="w-full h-32 object-cover mb-2"/>
            {img.caption && <p className="text-sm mb-2">{img.caption}</p>}
            <button 
              onClick={() => handleDelete(img._id)} 
              className="bg-red-500 text-white px-3 py-1 rounded">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSlider;
