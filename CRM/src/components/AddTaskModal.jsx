import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const AddTaskModal = ({ isOpen, onClose, refreshTasks }) => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Document Collection",
    priority: "Medium",
    assignedToAdmin: "",
    clientId: "",
    clientType: "candidate",
    dueDate: "",
    notes: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!isOpen) return;

    // Fetch admins
    axios
      .get("http://localhost:5000/api/admins", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setAdmins(res.data))
      .catch(err => console.error(err));

    // Fetch candidates + agents
    axios
      .get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, [isOpen, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Define required fields and friendly labels
  const requiredFields = [
    { name: "title", label: "Title" },
    { name: "description", label: "Description" },
    { name: "category", label: "Category" },
    { name: "assignedToAdmin", label: "Assigned Admin" },
    { name: "clientId", label: "User" },
    { name: "clientType", label: "User Type" },
    { name: "dueDate", label: "Due Date" }
  ];

  // Check for missing fields
  const missingFields = requiredFields
    .filter(field => !form[field.name])
    .map(field => field.label);

  if (missingFields.length > 0) {
    alert(`Please provide the following fields: ${missingFields.join(", ")}`);
    return;
  }

  try {
    await axios.post("http://localhost:5000/api/tasks", form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Task created successfully", form);
    alert("Task created successfully");
    refreshTasks(); // Refresh tasks after adding
    onClose();
    setForm({
      title: "",
      description: "",
      category: "Document Collection",
      priority: "Medium",
      assignedToAdmin: "",
      clientId: "",
      clientType: "candidate",
      dueDate: "",
      notes: ""
    });
  } catch (err) {
    console.error("Error creating task:", err);
    alert(err.response?.data?.message || "Error creating task");
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
      >
        <h2 className="text-xl font-bold mb-4">Add Task</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <textarea
            placeholder="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            {[
              "Document Collection",
              "Job Placement",
              "Communication",
              "Partnership Management",
              "Business Development",
              "Visa Processing",
              "Financial",
              "Administrative",
              "Training",
              "Assessment"
            ].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            {["High", "Medium", "Low"].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            name="assignedToAdmin"
            value={form.assignedToAdmin}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Admin</option>
            {admins.map(admin => (
              <option key={admin._id} value={admin._id}>{admin.name} ({admin.email})</option>
            ))}
          </select>
          <select
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Select User (Optional)</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.userType})</option>
            ))}
          </select>
          <select
            name="clientType"
            value={form.clientType}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="candidate">Candidate</option>
            <option value="agent">Agent</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <textarea
            placeholder="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddTaskModal;
