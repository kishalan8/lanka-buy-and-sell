import React, { useState, useEffect } from "react"; 
import { motion } from "framer-motion";
import axios from "axios";

const EditTaskModel = ({ isOpen, onClose, refreshTasks, task }) => {
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
    if (!isOpen || !task) return;

    // Prefill form with task data
    setForm({
      title: task.title || "",
      description: task.description || "",
      category: task.category || "Document Collection",
      priority: task.priority || "Medium",
      assignedToAdmin: task.assignedToAdmin || "",
      clientId: task.clientId || "",
      clientType: task.clientType || "candidate",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      notes: task.notes || ""
    });

    // Fetch admins
    axios
      .get("http://localhost:5000/api/admins", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setAdmins(res.data))
      .catch(err => console.error(err));

    // Fetch users
    axios
      .get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, [isOpen, task, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:5000/api/tasks/${task._id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Task updated successfully", form);
      alert("Task updated successfully");
      refreshTasks();
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
      alert(err.response?.data?.message || "Error updating task");
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
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>
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
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditTaskModel;
