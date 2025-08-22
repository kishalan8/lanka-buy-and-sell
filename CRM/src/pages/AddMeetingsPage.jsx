import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";
import Select from "react-select";

const AddMeetingsPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("authUser"));

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    duration: 30,
    location: "",
    meetingLink: "",
    type: "Candidate Interview",
    status: "Scheduled",
    notes: "",
    participants: [],
  });

  const [participantOptions, setParticipantOptions] = useState([]);

  // Fetch users and admins
  const fetchParticipants = async () => {
    try {
      const [usersRes, adminsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admins", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const admins = adminsRes.data.map((a) => ({
        value: { refId: a._id, userType: 'AdminUser', name: a.name, email: a.email },
        label: `Admin - ${a.name} ((${a.userType} . ${a.email})`,
      }));

      const users = usersRes.data.map((u) => ({
        value: { refId: u._id, userType: u.userType, name: u.name, email: u.email },
        label: `User - ${u.name} (${u.userType} . ${u.email})`,
      }));

      setParticipantOptions([...admins, ...users]);
    } catch (err) {
      console.error("Error fetching participants:", err);
      toast.error("Failed to load participants");
    }
  };

  useEffect(() => {
    if (token) fetchParticipants();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const handleParticipantsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      participants: selectedOptions || [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !admin) {
      toast.error("You are not authorized");
      return;
    }

    try {
      // Transform participants to match schema
      const payload = {
        ...formData,
        participants: formData.participants.map((p) => ({
          refId: p.value.refId,
          userType: p.value.userType || p.value.role, // must match enum: 'AdminUser' or 'User'
          name: p.value.name,
          email: p.value.email,
        })),
      };

      await axios.post("http://localhost:5000/api/meetings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Meeting created successfully!");
      navigate("/admin-dashboard/meetings");
    } catch (err) {
      console.error("Error creating meeting:", err);
      toast.error("Failed to create meeting");
    }
  };

  return (
    <motion.div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Add New Meeting</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Date, Time, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min={1}
              required
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Meeting Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
          <input
            type="text"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Type & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            >
              <option>Candidate Interview</option>
              <option>Agent Meeting</option>
              <option>Internal Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            >
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Canceled</option>
            </select>
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Participants</label>
          <Select
            isMulti
            options={participantOptions}
            value={formData.participants}
            onChange={handleParticipantsChange}
            placeholder="Select participants..."
            className="mt-1"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Add Meeting
        </button>
      </form>
    </motion.div>
  );
};

export default AddMeetingsPage;
