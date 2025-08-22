import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Video, Phone, Building, Trash2, Plus, Edit2 } from "lucide-react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-hot-toast";

const Meetings = () => {
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("authUser"));

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [editMeeting, setEditMeeting] = useState(null);
  const [participantOptions, setParticipantOptions] = useState([]);

  // Fetch meetings and participants
  useEffect(() => {
    if (!token || !admin) return;

    const fetchMeetings = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/meetings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myMeetings = data.filter((m) => m.createdBy?._id === admin.id);
        setMeetings(myMeetings);
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
        toast.error("Failed to fetch meetings");
      } finally {
        setLoading(false);
      }
    };

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
          value: { refId: a._id, userType: "AdminUser", name: a.name, email: a.email },
          label: `Admin - ${a.name} (${a.email})`,
        }));

        const users = usersRes.data.map((u) => ({
          value: { refId: u._id, userType: "User", name: u.name, email: u.email },
          label: `User - ${u.name} (${u.userType}) • ${u.email}`,
        }));

        setParticipantOptions([...admins, ...users]);
      } catch (err) {
        console.error("Error fetching participants:", err);
        toast.error("Failed to load participants");
      }
    };

    fetchMeetings();
    fetchParticipants();
  }, []);

  // Filtered meetings
  const filteredMeetings = meetings.filter((meeting) => {
    const participantsNames = meeting.participants.map(
      (p) => p.refId?.name || p.name || "Unknown"
    );
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participantsNames.some((name) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === "All" || meeting.status === statusFilter;
    const matchesType = typeFilter === "All" || meeting.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLocationIcon = (location) => {
    if (
      location.includes("Zoom") ||
      location.includes("Google Meet") ||
      location.includes("Microsoft Teams")
    )
      return <Video size={16} className="text-blue-600" />;
    if (location.includes("Phone")) return <Phone size={16} className="text-green-600" />;
    return <Building size={16} className="text-purple-600" />;
  };

  // Open edit modal and format participants for React-Select
  const handleEditClick = (meeting) => {
    const formattedParticipants = meeting.participants.map((p) => ({
      value: {
        refId: p.refId?._id || p.refId,
        userType: p.userType,
        name: p.name,
        email: p.email,
      },
      label: `${p.name} (${p.userType} • ${p.email})`,
    }));

    setEditMeeting({
      ...meeting,
      participants: formattedParticipants,
    });
  };

  // Save edited meeting
  const handleEditSave = async () => {
    try {
      // Transform participants back to backend format
      const payload = {
        ...editMeeting,
        participants: editMeeting.participants.map((p) => ({
          refId: p.value.refId,
          userType: p.value.userType,
          name: p.value.name,
          email: p.value.email,
        })),
      };

      const { data } = await axios.put(
        `http://localhost:5000/api/meetings/${editMeeting._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings(meetings.map((m) => (m._id === data._id ? data : m)));
      setEditMeeting(null);
      toast.success("Meeting updated successfully");
    } catch (error) {
      console.error("Failed to save meeting:", error);
      toast.error("Failed to save meeting");
    }
  };

  // Delete meeting
  const handleDelete = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeetings(meetings.filter((m) => m._id !== meetingId));
      toast.success("Meeting deleted successfully");
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading meetings...</p>;

  return (
    <motion.div className="space-y-8 md:p-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Meetings
          </h1>
          <p className="text-gray-600 text-sm">View all scheduled meetings and interviews</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          >
            {["All", "Scheduled", "Completed", "Canceled"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          >
            {["All", "Candidate Interview", "Agent Meeting", "Internal Meeting"].map(
              (option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              )
            )}
          </select>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          />
        </div>
      </div>

      {/* Meetings Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        {filteredMeetings.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left px-4 py-2">Title</th>
                <th className="text-left px-4 py-2">Date & Time</th>
                <th className="text-left px-4 py-2">Location</th>
                <th className="text-left px-4 py-2">Participants</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map((meeting) => (
                <tr key={meeting._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{meeting.title}</td>
                  <td className="px-4 py-2">
                    {formatDate(meeting.date)} • {meeting.time} • {meeting.duration} mins
                  </td>
                  <td className="px-4 py-2 flex items-center gap-1">
                    {getLocationIcon(meeting.location)} {meeting.location}
                  </td>
                  <td className="px-4 py-2">
                    {meeting.participants.map((p, idx) => {
                      const name = p.refId?.name || p.name || "Unknown";
                      const email = p.refId?.email || p.email || "N/A";
                      const userType = p.userType || "N/A";
                      return (
                        <div key={idx} className="flex flex-col">
                          <span className="font-medium">{name}</span>
                          <span className="text-sm text-gray-500">
                            {email} • {userType}
                          </span>
                        </div>
                      );
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full border ${getStatusColor(
                        meeting.status
                      )}`}
                    >
                      {meeting.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => setSelectedMeeting(meeting)} className="p-2 text-blue-600">
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditClick(meeting)}
                      className="p-2 text-green-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(meeting._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-6 text-gray-500">No meetings found</p>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {selectedMeeting && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-start p-4 z-50 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMeeting(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mt-20 p-6"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Meeting Details</h3>
              <p>
                <strong>Title:</strong> {selectedMeeting.title}
              </p>
              <p>
                <strong>Type:</strong> {selectedMeeting.type}
              </p>
              <p>
                <strong>Date & Time:</strong> {formatDate(selectedMeeting.date)} • {selectedMeeting.time}
              </p>
              <p>
                <strong>Duration:</strong> {selectedMeeting.duration} mins
              </p>
              <p>
                <strong>Location:</strong> {selectedMeeting.location}
              </p>
              <p>
                <strong>Meeting Link:</strong>{" "}
                <a href={selectedMeeting.meetingLink} target="_blank" className="text-blue-600">
                  {selectedMeeting.meetingLink}
                </a>
              </p>
              <p>
                <strong>Status:</strong> {selectedMeeting.status}
              </p>
              <p>
                <strong>Participants:</strong>
              </p>
              <div className="space-y-1">
                {selectedMeeting.participants.map((p, idx) => {
                  const name = p.refId?.name || p.name || "Unknown";
                  const email = p.refId?.email || p.email || "N/A";
                  const userType = p.userType || "N/A";
                  return (
                    <div key={idx}>
                      {name} • {email} • {userType}
                    </div>
                  );
                })}
              </div>
              <p>
                <strong>Created By:</strong> {selectedMeeting.createdBy?.name || "Admin"}
              </p>
              <p>
                <strong>Notes:</strong> {selectedMeeting.notes}
              </p>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editMeeting && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-start p-4 z-50 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMeeting(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mt-20 p-6"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Edit Meeting</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editMeeting.title}
                  onChange={(e) => setEditMeeting({ ...editMeeting, title: e.target.value })}
                  placeholder="Title"
                />
                <select
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editMeeting.type}
                  onChange={(e) => setEditMeeting({ ...editMeeting, type: e.target.value })}
                >
                  {["Candidate Interview", "Agent Meeting", "Internal Meeting"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editMeeting.date ? editMeeting.date.split("T")[0] : ""}
                  onChange={(e) => setEditMeeting({ ...editMeeting, date: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editMeeting.time || ""}
                  onChange={(e) => setEditMeeting({ ...editMeeting, time: e.target.value })}
                  placeholder="Time"
                />
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editMeeting.duration || ""}
                  onChange={(e) => setEditMeeting({ ...editMeeting, duration: e.target.value })}
                  placeholder="Duration (mins)"
                />
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editMeeting.location || ""}
                  onChange={(e) => setEditMeeting({ ...editMeeting, location: e.target.value })}
                  placeholder="Location"
                />
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editMeeting.meetingLink || ""}
                  onChange={(e) => setEditMeeting({ ...editMeeting, meetingLink: e.target.value })}
                  placeholder="Meeting Link"
                />
                <select
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editMeeting.status}
                  onChange={(e) => setEditMeeting({ ...editMeeting, type: e.target.value })}
                >
                  {["Scheduled", "Completed", "Canceled"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <textarea
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editMeeting.notes || ""}
                  onChange={(e) => setEditMeeting({ ...editMeeting, notes: e.target.value })}
                  placeholder="Notes"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Participants</label>
                  <Select
                    isMulti
                    options={participantOptions}
                    value={editMeeting.participants || []}
                    getOptionValue={(option) => option.value.refId}
                    getOptionLabel={(option) => option.label}
                    onChange={(selectedOptions) =>
                      setEditMeeting({ ...editMeeting, participants: selectedOptions || [] })
                    }
                    placeholder="Select participants..."
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMeeting(null)}
                    className="px-4 py-2 bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Meetings;
