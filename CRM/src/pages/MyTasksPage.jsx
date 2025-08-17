import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Clock, Calendar } from "lucide-react";
import AddTaskModal from "../components/AddTaskModal";
import axios from "axios";
import toast from "react-hot-toast";

const MyTasksPage = () => {
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("authUser")); // Logged-in admin info
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Fetch tasks assigned to this admin
  const fetchTasks = async () => {
    if (!token || !admin) return;

    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter tasks assigned to logged-in admin using `assignedToAdmin.id`
      const myTasks = res.data.filter(
        (task) =>
          task.assignedToAdmin &&
          task.assignedToAdmin.id === admin.id
      );
      setTasks(myTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const hoverButton = {
    hover: { scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.98 },
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-amber-100 text-amber-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending": return { color: "bg-yellow-100 text-yellow-800", icon: Clock };
      case "Completed": return { color: "bg-green-100 text-green-800", icon: CheckCircle2 };
      default: return { color: "bg-gray-100 text-gray-500", icon: Clock };
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Document Collection": "bg-indigo-100 text-indigo-800",
      "Job Placement": "bg-emerald-100 text-emerald-800",
      Communication: "bg-violet-100 text-violet-800",
      "Partnership Management": "bg-cyan-100 text-cyan-800",
      "Business Development": "bg-yellow-100 text-yellow-800",
      "Visa Processing": "bg-pink-100 text-pink-800",
      Financial: "bg-orange-100 text-orange-800",
      Administrative: "bg-gray-100 text-gray-800",
      Training: "bg-lime-100 text-lime-800",
      Assessment: "bg-teal-100 text-teal-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const toggleDone = async (task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    try {
      await axios.patch(
        `http://localhost:5000/api/tasks/${task._id}/complete`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to update task status");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "All" || task.status === filter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">My Tasks</h1>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <div className="flex gap-2">
          {["All", "Pending", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === status ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {filteredTasks.length === 0 && (
            <motion.div className="p-6 text-center text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              No tasks found
            </motion.div>
          )}

          {filteredTasks.map((task) => {
            const StatusIcon = getStatusConfig(task.status).icon;
            return (
              <motion.div
                key={task._id}
                className="p-4 rounded-xl mb-3 bg-white shadow-sm flex justify-between items-center hover:shadow-lg transition"
              >
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                   {task.title}
                  </h4>
                  <br/>
                  <p className="text-muted-dark text-xs sm:text-sm leading-relaxed max-w-3xl">{task.description}</p>
                  <br/>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusConfig(task.status).color}`}>
                      <StatusIcon size={12} className="inline mr-1" />
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                  </div>
                  <br/>
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                          <Calendar size={12} className="mr-1" />
                          <span>Due: {task.dueDate?.split("T")[0]}</span>
                      </div>
                  </div>
                </div>
                {task.status !== "Completed" && (
                  <motion.button
                      onClick={() => toggleDone(task)}
                      variants={hoverButton}
                      whileHover="hover"
                      whileTap="tap"
                      className="p-2 rounded-lg cursor-pointer transition-all duration-100 text-green-600 hover:shadow-md hover:border-transparent bg-white"
                      title={task.status === "Completed" ? "Mark as Pending" : "Mark as Completed"}
                 >
                      <CheckCircle2 size={16} />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} refreshTasks={fetchTasks} />
    </div>
  );
};

export default MyTasksPage;
