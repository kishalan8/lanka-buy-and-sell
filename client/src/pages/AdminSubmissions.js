import React, { useEffect, useState } from 'react';
import axios from 'axios';

const IMAGE_BASE_URL = 'http://localhost:5000/uploads/';

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/submissions');
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/submissions/${id}`);
      setSubmissions(submissions.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this submission? It will be added to used bikes.')) return;

    try {
      await axios.post(`http://localhost:5000/api/submissions/${id}/approve`);
      // Remove the approved submission from the list
      setSubmissions(submissions.filter((item) => item._id !== id));
      alert('Submission approved and added to used bikes.');
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Failed to approve submission. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Submissions</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Make</th>
            <th className="p-2">Model</th>
            <th className="p-2">Year</th>
            <th className="p-2">Price</th>
            <th className="p-2">Seller</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Email</th>
            <th className="p-2">Images</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission._id} className="border-t">
              <td className="p-2">{submission.make}</td>
              <td className="p-2">{submission.model}</td>
              <td className="p-2">{submission.year}</td>
              <td className="p-2">{submission.price}</td>
              <td className="p-2">{submission.sellerName}</td>
              <td className="p-2">{submission.sellerPhone || '—'}</td>
              <td className="p-2">{submission.sellerEmail || '—'}</td>
              <td className="p-2 flex gap-2">
                {submission.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:5000${img}`}
                    alt={`Bike ${idx}`}
                    className="w-16 h-16 object-cover border"
                  />
                ))}
              </td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleApprove(submission._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDelete(submission._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSubmissions;
