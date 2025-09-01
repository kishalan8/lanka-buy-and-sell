import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Calendar, Filter, Search, Eye } from "lucide-react";
import AddBikeModel from "../components/AddBikeModel";
import EditBikeModel from "../components/EditBikeModel";
import ViewBikeModel from "../components/ViewBikeModel";
import axios from "axios";

const IMAGE_BASE_URL = "http://localhost:5000/uploads/";

const BikesPage = () => {
  const [bikes, setBikes] = useState([]);
  const [hoveredBike, setHoveredBike] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddBikeOpen, setIsAddBikeOpen] = useState(false);
  const [isEditBikeOpen, setIsEditBikeOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editBikeData, setEditBikeData] = useState(null);
  const [selectedBike, setSelectedBike] = useState(null);
  const token = localStorage.getItem("token");

  const fetchBikes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bikes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBikes(res.data.data);
    } catch (err) {
      console.error("Error fetching bikes:", err);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const getConditionColor = (condition) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800";
      case "used":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBikes = bikes.filter((bike) => {
    const matchesFilter = filter === "All" || bike.condition === filter;
    const matchesSearch =
      bike.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bike.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: bikes.length,
    new: bikes.filter((b) => b.condition === "new").length,
    used: bikes.filter((b) => b.condition === "used").length,
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2, duration: 0.6 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
  const hoverCard = { hover: { y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", transition: { type: "spring", stiffness: 200 } } };
  const hoverButton = { hover: { scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" }, tap: { scale: 0.98 } };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bike?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/bikes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchBikes();
    } catch (err) {
      console.error(err);
      alert("Failed to delete bike");
    }
  };

  const handleView = (bike) => {
    setSelectedBike(bike);
    setIsViewOpen(true);
  };

  // Handle closing modal
  const handleCloseView = () => {
    setSelectedBike(null);
    setIsViewOpen(false);
  };

  const handleEdit = (bike) => {
    setEditBikeData(bike);
    setIsEditBikeOpen(true);
  };


  return (
    <div className="md:p-6">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-heading-lg text-center sm:text-left font-bold bg-gradient-primary bg-clip-text text-transparent pb-1">
              Bike Inventory
            </h1>
            <p className="text-muted-dark text-center sm:text-left text-sm sm:text-base">
              Manage and track all bikes in the system
            </p>
          </div>
          <motion.div className="flex gap-3 mx-auto md:mx-0" whileHover={{ scale: 1.02 }}>
            <motion.button
              onClick={() => setIsAddBikeOpen(true)}
              className="group relative overflow-hidden flex items-center gap-2 sm:gap-3 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl bg-gradient-primary transition-all duration-300 text-sm sm:text-base cursor-pointer"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(15, 121, 197, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} className="sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" />
              <span className="hidden sm:inline">Add New Bike</span>
              <span className="sm:hidden">Add Bike</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Total", value: stats.total, color: "bg-blue-100", text: "text-blue-500" },
            { label: "New", value: stats.new, color: "bg-green-100", text: "text-green-500" },
            { label: "Used", value: stats.used, color: "bg-yellow-100", text: "text-yellow-500" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={hoverCard} whileHover="hover" className="bg-white/80 rounded-xl shadow-md border border-white/20 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-dark font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="bg-white/80 rounded-xl shadow-md border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bikes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-all duration-300 bg-white/80"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full sm:w-auto">
              {["All", "new", "used"].map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setFilter(status)}
                  variants={hoverButton}
                  whileHover="hover"
                  whileTap="tap"
                  className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-sm transition-all duration-300 ${
                    filter === status ? "bg-gradient-primary text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bikes List */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="divide-y divide-gray-100">
            <AnimatePresence mode="wait">
              {filteredBikes.length > 0 ? (
                filteredBikes.map((bike) => (
                  <motion.div
                    key={bike._id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: 20 }}
                    className="group relative p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-300"
                    onMouseEnter={() => setHoveredBike(bike._id)}
                    onMouseLeave={() => setHoveredBike(null)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 border-b sm:border-none border-gray-200 pb-2 sm:pb-0">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-4">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900">{bike.model}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getConditionColor(bike.condition)}`}>
                            {bike.condition}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-800">
                            {bike.brand}
                          </span>
                        </div>
                        <p className="text-muted-dark text-xs sm:text-sm">{bike.description}</p>
                        <div className="flex gap-4 text-xs text-muted-dark">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Price: LKR {bike.price}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>Stock: {bike.stock}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center lg:flex-col gap-2">
                        <motion.button
                          onClick={() => handleEdit(bike)}
                          variants={hoverButton}
                          whileHover="hover"
                          whileTap="tap"
                          className="p-2 rounded-lg cursor-pointer transition-all duration-100 text-blue-600 hover:shadow-md hover:border-transparent bg-white"
                          title="Edit bike"
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(bike._id)}
                          variants={hoverButton}
                          whileHover="hover"
                          whileTap="tap"
                          className="p-2 rounded-lg cursor-pointer transition-all duration-100 text-red-600 hover:shadow-md hover:border-transparent bg-white"
                          title="Delete bike"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleView(bike)}
                          variants={hoverButton}
                          whileHover="hover"
                          whileTap="tap"
                          className="p-2 rounded-lg cursor-pointer transition-all duration-100 text-blue-600 hover:shadow-md hover:border-transparent bg-white"
                          title="View bike"
                        >
                          <Eye size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No bikes found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Modals */}
      <AddBikeModel isOpen={isAddBikeOpen} onClose={() => setIsAddBikeOpen(false)} refreshBikes={fetchBikes} />
      <EditBikeModel isOpen={isEditBikeOpen} onClose={() => setIsEditBikeOpen(false)} refreshBikes={fetchBikes} bike={editBikeData} />
      <ViewBikeModel isOpen={isViewOpen} onClose={handleCloseView} bike={selectedBike} />
    </div>
  );
};

export default BikesPage;
