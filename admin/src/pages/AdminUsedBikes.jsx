import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const IMAGE_BASE_URL = 'http://localhost:5000/uploads/';

const AdminUsedBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    stock: '',
    condition: 'used',
    images: [],       // existing filenames
    imageFiles: [],   // newly selected files
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

    form.imageFiles.forEach(file => formData.append('images', file));

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
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];

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

  const resetForm = () => {
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setForm({
      make: '',
      model: '',
      year: '',
      price: '',
      stock: '',
      condition: 'used',
      images: [],
      imageFiles: [],
      description: '',
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    previewUrlsRef.current = files.map(file => URL.createObjectURL(file));
    setForm({ ...form, imageFiles: files });
  };

  const handleNumberChange = (field, e) => {
    const val = e.target.value;
    setForm({ ...form, [field]: val === '' ? '' : Number(val) });
  };

  const getBase64Image = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous"); // avoid CORS issues
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg")); // base64 string
    };
    img.onerror = (err) => reject(err);
  });
};


  const generateReport = async () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Used Motorbike Inventory Report", 14, 15);

  const tableColumn = ["Bike ID", "Images", "Make", "Model", "Year", "Price", "Stock", "Condition"];
  const tableRows = [];

  const bikesWithBase64 = await Promise.all(
    bikes.map(async (bike) => {
      let base64Img = null;
      if (bike.images && bike.images.length > 0) {
        try {
          base64Img = await getBase64Image(IMAGE_BASE_URL + bike.images[0]); // only first image
        } catch (e) {
          console.error("Image load failed:", e);
        }
      }
      return { ...bike, base64Img };
    })
  );

  bikes.forEach(bike => {
    const bikeData = [
      bike.bikeID || "-",
      bike.base64Img || "",
      bike.make,
      bike.model,
      bike.year,
      bike.price,
      bike.stock,
      bike.condition,
    ];
    tableRows.push(bikeData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 10, cellPadding: 3 ,valign: 'middle'},
    headStyles: { fillColor: [41, 128, 185] },
    didDrawCell: (data) => {
      if (data.column.index === 1 && data.cell.raw) {
        doc.addImage(data.cell.raw, "JPEG", data.cell.x + 2, data.cell.y + 2, 20, 15);
      }
    },
  });

  doc.save("Used_Bike_Report.pdf");
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
        <button
          onClick={generateReport}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Export Report (PDF)
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
              placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
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
              placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
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
                  <img key={idx} src={IMAGE_BASE_URL + img} alt="" className="h-12 w-20 object-cover" />
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

export default AdminUsedBikes;
