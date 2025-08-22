import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const EditLeadModal = ({ isOpen, onClose, onSave, lead}) => {
  const [formData, setFormData] = useState({
    status: lead?.status || "New Lead",
    priority: lead?.priority || "Medium",
    assignedTo: lead?.assignedTo || "",
  });

  const [admins, setAdmins] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const statusOptions = ["New Lead", "Reviewed", "Approved", "Rejected"];
  const priorityOptions = ["High", "Medium", "Low"];
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("authUser"));

  // Populate form when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({
        status: lead.status || "New Lead",
        priority: lead.priority || "Medium",
        assignedTo: lead.assignedTo?._id || "",
      });
    }
  }, [lead]);

  // Fetch admins for dropdown
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admins", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAdmins(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedLead = {
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo,
      };
      await onSave(lead._id, updatedLead);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <motion.div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Lead</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-semibold mb-1">Assigned To</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Admin</option>
                    {admins.map(admin => (
                      <option key={admin._id} value={admin._id}>{admin.name} ({admin.email})</option>
                    ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-70"
                >
                  {isSubmitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditLeadModal;
