import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Eye, FileText } from "lucide-react";
import AddBikeModel from "../components/AddBikeModel";
import EditBikeModel from "../components/EditBikeModel";
import ViewBikeModel from "../components/ViewBikeModel";
import axios from "axios";
import { jsPDF } from "jspdf";

const BikesPage = () => {
  const [bikes, setBikes] = useState([]);
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

  const handleEdit = (bike) => {
    setEditBikeData(bike);
    setIsEditBikeOpen(true);
  };

  const handleView = (bike) => {
    setSelectedBike(bike);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setSelectedBike(null);
    setIsViewOpen(false);
  };

  // PDF for single bike
  const generateBikeReport = (bike) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${bike.brand} ${bike.model} Report`, 10, 20);
    doc.setFontSize(12);
    let y = 30;
    const fields = [
      ["Bike ID", bike.bikeID],
      ["Brand", bike.brand],
      ["Model", bike.model],
      ["Year", bike.year],
      ["Price", bike.price || "N/A"],
      ["Stock", bike.stock || "N/A"],
      ["Mileage", bike.mileage || "N/A"],
      ["Engine Capacity", bike.engineCapacity || "N/A"],
      ["Condition", bike.condition],
      ["Status", bike.status],
      ["Owner Name", bike.ownerName || "N/A"],
      ["Owner Contact", bike.ownerContact || "N/A"],
      ["Description", bike.description || "N/A"],
    ];

    fields.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 10, y);
      y += 10;
      if (y > 280) { doc.addPage(); y = 20; }
    });

    if (bike.documents && bike.documents.length > 0) {
      doc.text("Documents:", 10, y); y += 10;
      bike.documents.forEach((docItem, idx) => {
        doc.text(`${idx + 1}. ${docItem.type} (${docItem.fileName})`, 12, y);
        y += 8;
        if (y > 280) { doc.addPage(); y = 20; }
      });
    }

    doc.save(`${bike.brand}_${bike.model}_report.pdf`);
  };

  // PDF for all bikes
  const generateAllBikesReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Bike Inventory Report", 10, 20);
    doc.setFontSize(12);
    let y = 30;

    bikes.forEach((bike, index) => {
      doc.text(`${index + 1}. ${bike.brand} ${bike.model}`, 10, y); y += 8;
      const fields = [
        ["Bike ID", bike.bikeID],
        ["Year", bike.year],
        ["Price", bike.price || "N/A"],
        ["Stock", bike.stock || "N/A"],
        ["Mileage", bike.mileage || "N/A"],
        ["Engine Capacity", bike.engineCapacity || "N/A"],
        ["Condition", bike.condition],
        ["Status", bike.status],
        ["Owner Name", bike.ownerName || "N/A"],
        ["Owner Contact", bike.ownerContact || "N/A"],
        ["Description", bike.description || "N/A"],
      ];
      fields.forEach(([label, value]) => { doc.text(`${label}: ${value}`, 12, y); y += 6; });
      if (bike.documents && bike.documents.length > 0) {
        doc.text("Documents:", 12, y); y += 6;
        bike.documents.forEach((docItem, idx) => { doc.text(`${idx + 1}. ${docItem.type} (${docItem.fileName})`, 14, y); y += 6; });
      }
      y += 6;
      if (y > 280) { doc.addPage(); y = 20; }
    });

    doc.save("Bike_Inventory_Report.pdf");
  };

  const filteredBikes =
    filter === "All"
      ? bikes
      : bikes.filter((bike) => bike.condition === filter);
  const hoverCard = { hover: { y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", transition: { type: "spring", stiffness: 200 } } };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Bike Inventory</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddBikeOpen(true)}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition"
          >
            <Plus size={14} /> Add Bike
          </button>
          <button
            onClick={generateAllBikesReport}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition"
          >
            <FileText size={14} /> Generate Report
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex gap-2 mb-6">
        {["All", "new", "used"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded text-sm ${
              filter === status ? "bg-gray-400 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search..."
          className="ml-auto px-3 py-1 border rounded text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Bike Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBikes.length === 0 && <div>No bikes found.</div>}
        {filteredBikes.map((bike) => (
          <motion.div
            key={bike._id}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col relative border border-gray-200"
            whileHover={{ y: -5 }}
          >
            {/* Condition badge */}
            <span
              className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
                bike.condition === "new"
                  ? "bg-green-200 text-green-800"
                  : "bg-yellow-200 text-yellow-800"
              }`}
            >
              {bike.condition}
            </span>

            {/* Images */}
            {bike.images && bike.images.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {bike.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`bike-${idx}`}
                    className="w-32 h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}

            <h3 className="font-bold text-lg mb-1">{bike.brand} {bike.model}</h3>
            <p className="text-sm text-gray-600 mb-2">{bike.description}</p>
            <div className="flex flex-wrap gap-2 text-gray-700 text-sm mb-2">
              <span>Year: {bike.year}</span>
              <span>Price: LKR {bike.price?.toLocaleString()}</span>
              <span>Mileage: {bike.mileage || "N/A"} km</span>
              <span>Engine: {bike.engineCapacity || "N/A"} cc</span>
              <span>Stock: {bike.stock || "N/A"}</span>
              <span>Status: {bike.status}</span>
              <span>Owner: {bike.ownerName || "N/A"}</span>
              <span>Contact: {bike.ownerContact || "N/A"}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2 flex-wrap">
              <button
                onClick={() => handleEdit(bike)}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition"
              >
                <Edit2 size={14} className="text-blue-500"/> Edit
              </button>
              <button
                onClick={() => handleDelete(bike._id)}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition"
              >
                <Trash2 size={14} className="text-blue-500"/> Delete
              </button>
              <button
                onClick={() => handleView(bike)}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition"
              >
                <Eye size={14} className="text-blue-500"/> View
              </button>
              <button
                onClick={() => generateBikeReport(bike)}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition"
              >
                <FileText size={14} className="text-blue-500"/> Report
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      <AddBikeModel isOpen={isAddBikeOpen} onClose={() => setIsAddBikeOpen(false)} refreshBikes={fetchBikes} />
      <EditBikeModel isOpen={isEditBikeOpen} onClose={() => setIsEditBikeOpen(false)} refreshBikes={fetchBikes} bike={editBikeData} />
      <ViewBikeModel isOpen={isViewOpen} onClose={handleCloseView} bike={selectedBike} />
    </div>
  );
};

export default BikesPage;
