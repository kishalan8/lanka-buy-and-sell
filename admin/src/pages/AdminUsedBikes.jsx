import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const AdminUsedBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    stock: '',
    condition: 'used',
    description: '',
    documents: {},      // cloudinary urls
    documentFiles: {},  // selected files for upload
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const previewUrlsRef = useRef({});

  useEffect(() => {
    fetchBikes();
    return () => {
      Object.values(previewUrlsRef.current).forEach(url =>
        URL.revokeObjectURL(url)
      );
      previewUrlsRef.current = {};
    };
  }, []);

  const fetchBikes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bikes');
      setBikes(res.data.filter(b => b.condition === 'used'));
    } catch {
      alert('Failed to fetch bikes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('make', form.make);
    formData.append('model', form.model);
    formData.append('year', Number(form.year));
    formData.append('price', Number(form.price));
    formData.append('stock', Number(form.stock));
    formData.append('condition', form.condition);
    formData.append('description', form.description);

    // Append document files
    Object.entries(form.documentFiles).forEach(([field, file]) => {
      if (file) formData.append(field, file);
    });

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/bikes/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('http://localhost:5000/api/bikes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      fetchBikes();
      resetForm();
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Save bike error:', error.response?.data || error.message);
      alert('Failed to save bike: ' + (error.response?.data?.error || error.message));
    }
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

  const startEdit = (bike) => {
    setForm({
      make: bike.make,
      model: bike.model,
      year: bike.year,
      price: bike.price,
      stock: bike.stock,
      condition: bike.condition,
      description: bike.description || '',
      documents: bike.documents || {},
      documentFiles: {},
    });
    setEditingId(bike._id);
    setShowForm(true);
  };

  const resetForm = () => {
    Object.values(previewUrlsRef.current).forEach(url =>
      URL.revokeObjectURL(url)
    );
    previewUrlsRef.current = {};
    setForm({
      make: '',
      model: '',
      year: '',
      price: '',
      stock: '',
      condition: 'used',
      description: '',
      documents: {},
      documentFiles: {},
    });
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (previewUrlsRef.current[field]) {
      URL.revokeObjectURL(previewUrlsRef.current[field]);
    }
    if (file) {
      previewUrlsRef.current[field] = URL.createObjectURL(file);
      setForm({
        ...form,
        documentFiles: { ...form.documentFiles, [field]: file },
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Used Motorbike Inventory</h2>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Used Bike
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
              onChange={e => setForm({ ...form, [f]: e.target.value })}
              className="border p-2 rounded"
              required
            />
          ))}

          <select
            value={form.condition}
            onChange={e => setForm({ ...form, condition: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="col-span-2 border p-2 rounded"
            rows="3"
          />

          {/* Upload documents */}
          {['bikeBook', 'revenueLicense', 'insurance', 'emissionTest'].map(field => (
            <div key={field} className="col-span-2">
              <label className="block font-medium mb-1">{field}</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => handleFileChange(field, e)}
                className="border p-2 rounded"
              />
              <div className="mt-2">
                {previewUrlsRef.current[field] ? (
                  <img src={previewUrlsRef.current[field]} alt={field} className="h-20 border" />
                ) : form.documents[field] ? (
                  <a href={form.documents[field]} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    View existing {field}
                  </a>
                ) : null}
              </div>
            </div>
          ))}

          <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded">
            {editingId ? 'Update Bike' : 'Add Bike'}
          </button>
        </form>
      )}

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">Bike ID</th>
            <th className="p-3">Make</th>
            <th className="p-3">Model</th>
            <th className="p-3">Year</th>
            <th className="p-3">Price</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Condition</th>
            <th className="p-3">Documents</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bikes.map(bike => (
            <tr key={bike._id} className="border-t">
              <td className="p-3 font-mono text-sm">{bike.bikeID || '-'}</td>
              <td className="p-3">{bike.make}</td>
              <td className="p-3">{bike.model}</td>
              <td className="p-3">{bike.year}</td>
              <td className="p-3">{bike.price}</td>
              <td className="p-3">{bike.stock}</td>
              <td className="p-3 capitalize">{bike.condition}</td>
              <td className="p-3">
                {bike.documents && bike.documents.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {bike.documents.map((doc, idx) => (
                      <li key={idx}>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          {doc.type} ({doc.status})
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : 'No documents'}
              </td>
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

export default AdminUsedBikes;
