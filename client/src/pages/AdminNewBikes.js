import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const IMAGE_BASE_URL = 'http://localhost:5000/uploads/';

const AdminNewBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    stock: '',
    condition: 'new',
    images: [],     // existing filenames
    imageFiles: [], // newly selected files
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const previewUrlsRef = useRef([]);

  useEffect(() => {
    fetchBikes();
    return () => {
      previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
    };
  }, []);

  const fetchBikes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bikes');
      const newBikes = res.data.filter(b => b.condition === 'new');
      setBikes(newBikes);
    } catch (err) {
      alert('Failed to fetch bikes');
    }
  };

  const resetForm = () => {
    resetPreviewUrls();
    setForm({
      make: '',
      model: '',
      year: '',
      price: '',
      stock: '',
      condition: 'new',
      images: [],
      imageFiles: [],
      description: '',
    });
    setEditingId(null);
  };

  const resetPreviewUrls = () => {
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    resetPreviewUrls();
    previewUrlsRef.current = files.map(f => URL.createObjectURL(f));
    setForm({ ...form, imageFiles: files });
  };

  const handleNumberChange = (field, e) => {
    const val = e.target.value;
    setForm({ ...form, [field]: val === '' ? '' : Number(val) });
  };

  const startEdit = (bike) => {
    resetPreviewUrls();
    setForm({
      make: bike.make,
      model: bike.model,
      year: bike.year,
      price: bike.price,
      stock: bike.stock,
      condition: bike.condition,
      images: bike.images || [],
      imageFiles: [],
      description: bike.description || '',
    });
    setEditingId(bike._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bike?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/bikes/${id}`);
      fetchBikes();
    } catch {
      alert('Failed to delete bike');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('make', form.make);
    formData.append('model', form.model);
    formData.append('year', form.year.toString());
    formData.append('price', form.price.toString());
    formData.append('stock', form.stock.toString());
    formData.append('condition', form.condition);
    formData.append('description', form.description);

    form.imageFiles.forEach(file => formData.append('images', file));

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/bikes/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/bikes', formData);
      }
      fetchBikes();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Failed to save bike');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">New Motorbike Inventory</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add New Bike
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white shadow p-4 rounded grid grid-cols-2 gap-4"
          encType="multipart/form-data"
        >
          {['make', 'model'].map(f => (
            <input
              key={f}
              type="text"
              placeholder={f}
              value={form[f]}
              onChange={e => setForm({ ...form, [f]: e.target.value })}
              className="border p-2 rounded"
              required
            />
          ))}

          {['year', 'price', 'stock'].map(f => (
            <input
              key={f}
              type="number"
              placeholder={f}
              value={form[f]}
              onChange={e => handleNumberChange(f, e)}
              className="border p-2 rounded"
              required
            />
          ))}

          <select
            value={form.condition}
            onChange={e => setForm({ ...form, condition: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="col-span-2 border p-2 rounded"
            rows={3}
          />

          <div className="col-span-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="border p-2 rounded"
            />
            <div className="mt-2 flex gap-2 flex-wrap">
              {form.imageFiles.length > 0
                ? previewUrlsRef.current.map((url, idx) => (
                    <img key={idx} src={url} alt={`Preview ${idx}`} className="h-20 w-32 object-cover border" />
                  ))
                : form.images.map((img, idx) => (
                    <img key={idx} src={IMAGE_BASE_URL + img} alt={`Bike ${idx}`} className="h-20 w-32 object-cover border" />
                  ))}
            </div>
          </div>

          <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded">
            {editingId ? 'Update Bike' : 'Add Bike'}
          </button>
        </form>
      )}

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">Bike ID</th>
            <th className="p-3">Images</th>
            <th className="p-3">Make</th>
            <th className="p-3">Model</th>
            <th className="p-3">Year</th>
            <th className="p-3">Price</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Condition</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bikes.map(bike => (
            <tr key={bike._id} className="border-t">
              <td className="p-3 font-mono text-sm">{bike.bikeID || '-'}</td>
              <td className="p-3 flex gap-1">
                {bike.images && bike.images.length > 0 ? bike.images.map((img, idx) => (
                  <img key={idx} src={IMAGE_BASE_URL + img} alt={`${bike.make} ${bike.model}`} className="h-12 w-20 object-cover" />
                )) : 'No Image'}
              </td>
              <td className="p-3">{bike.make}</td>
              <td className="p-3">{bike.model}</td>
              <td className="p-3">{bike.year}</td>
              <td className="p-3">{bike.price}</td>
              <td className="p-3">{bike.stock}</td>
              <td className="p-3 capitalize">{bike.condition}</td>
              <td className="p-3">
                <button onClick={() => startEdit(bike)} className="text-blue-600 mr-3">Edit</button>
                <button onClick={() => handleDelete(bike._id)} className="text-red-600">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminNewBikes;
