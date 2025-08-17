import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit2, Trash2 } from "react-feather";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "SalesAdmin" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authUser = JSON.parse(localStorage.getItem("authUser"));

  useEffect(() => {
    if (!token || authUser?.role !== "MainAdmin") {
      navigate("/");
      return;
    }
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("authUser");
          navigate("/login");
        }
        return;
      }

      const data = await res.json();
      setAdmins(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:5000/api/admins/${editingId}`
      : "http://localhost:5000/api/admins/register";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Operation failed");
      }

      fetchAdmins();
      setForm({ name: "", email: "", password: "", role: "SalesAdmin" });
      setEditingId(null);
    } catch (err) {
      console.error(err.message);
      if (err.message.toLowerCase().includes("unauthorized")) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
        navigate("/login");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
        navigate("/login");
        return;
      }

      fetchAdmins();
    } catch (err) {
      console.error(err.message);
    }
  };

  if (!authUser || authUser.role !== "MainAdmin") {
    return <p className="p-4 text-center text-red-500">Access denied</p>;
  }

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
        Admin Management
      </h1>

      {/* Search & Form */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <input
          type="text"
          placeholder="Search admins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 p-2 rounded-lg border backdrop-blur-sm bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-3 p-4 rounded-xl backdrop-blur-md bg-white/20 shadow-md flex-1"
        >
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
            required
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
            required
          />
          {!editingId && (
            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
              required
            />
          )}
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="SalesAdmin">SalesAdmin</option>
            <option value="AgentAdmin">AgentAdmin</option>
          </select>

          <motion.button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer self-end mt-2 md:mt-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {editingId ? "Update" : "Add"} Admin
          </motion.button>
        </form>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full border-collapse backdrop-blur-md bg-white/10 text-left">
          <thead>
            <tr className="bg-gray-100/50">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
            {filteredAdmins.map((admin) => (
              <motion.tr
                key={admin._id}
                className="hover:bg-gray-100/20 transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <td className="px-4 py-2">{admin.name}</td>
                <td className="px-4 py-2">{admin.email}</td>
                <td className="px-4 py-2">{admin.role}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => {
                        setForm({ name: admin.name, email: admin.email, role: admin.role });
                        setEditingId(admin._id);
                      }}
                      className="p-2 rounded-lg text-green-600 hover:bg-gray-100/50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit2 size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(admin._id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-gray-100/50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredAdmins.map((admin) => (
          <motion.div
            key={admin._id}
            className="p-4 rounded-xl shadow-lg backdrop-blur-md bg-white/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-lg">{admin.name}</div>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => {
                    setForm({ name: admin.name, email: admin.email, role: admin.role });
                    setEditingId(admin._id);
                  }}
                  className="p-2 rounded-lg text-green-600 hover:bg-gray-100/50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 size={16} />
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(admin._id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-gray-100/50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </div>
            <div className="text-gray-700">{admin.email}</div>
            <div className="mt-1 text-sm text-gray-500">{admin.role}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminManagement;
