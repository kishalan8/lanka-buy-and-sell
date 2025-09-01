// src/pages/AdminUsers.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/users/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
    } catch {
      alert('Failed to delete user');
    }
  };

  const generateReport = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Users Report", 14, 15);
  
    const tableColumn = ["Name", "Email"];
    const tableRows = [];
  
    users.forEach(user => {
      const userData = [
        user.name,
        user.email,
      ];
      tableRows.push(userData);
    });
  
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 3 ,valign: 'middle'},
      headStyles: { fillColor: [41, 128, 185] },
    });
  
    doc.save("Users_Report.pdf");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Registered Users</h2>
      <button
          onClick={generateReport}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Export Report (PDF)
        </button>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full bg-white shadow rounded overflow-hidden">
          <thead className="bg-gray-200">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-t hover:bg-gray-100">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
