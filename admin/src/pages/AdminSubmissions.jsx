import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { jsPDF } from "jspdf";

const AdminSubmissionCard = ({ submission, onUpdateStatus }) => {

  // Generate PDF report
  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${submission.brand} ${submission.model} Report`, 10, 20);

    doc.setFontSize(12);
    doc.text(`Brand: ${submission.brand}`, 10, 30);
    doc.text(`Model: ${submission.model}`, 10, 40);
    doc.text(`Year: ${submission.year}`, 10, 50);
    doc.text(`Price: Rs. ${submission.price?.toLocaleString() || 'N/A'}`, 10, 60);
    doc.text(`Mileage: ${submission.mileage || 'N/A'}`, 10, 70);
    doc.text(`Engine Capacity: ${submission.engineCapacity || 'N/A'}`, 10, 80);
    doc.text(`Condition: ${submission.condition}`, 10, 90);
    doc.text(`Owner: ${submission.ownerName || 'N/A'}`, 10, 100);
    doc.text(`Contact: ${submission.ownerContact || 'N/A'}`, 10, 110);
    doc.text(`Status: ${submission.status}`, 10, 120);
    doc.text(`Description: ${submission.description || 'N/A'}`, 10, 130);

    if (submission.documents?.length) {
      let y = 140;
      doc.text("Documents:", 10, y);
      submission.documents.forEach((docItem, idx) => {
        y += 10;
        doc.text(`${idx + 1}. ${docItem.type} - ${docItem.fileName}`, 10, y);
      });
    }

    doc.save(`${submission.brand}_${submission.model}_report.pdf`);
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md p-4 flex flex-col relative border border-gray-200"
      whileHover={{ y: -5 }}
    >
      {/* Status badge */}
      <span
        className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
          submission.status === "approved"
            ? "bg-green-200 text-green-800"
            : submission.status === "rejected"
            ? "bg-red-200 text-red-800"
            : "bg-yellow-200 text-yellow-800"
        }`}
      >
        {submission.status}
      </span>

      {/* Images */}
      {submission.images && submission.images.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {submission.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`bike-${idx}`}
              className="w-32 h-20 object-cover rounded"
            />
          ))}
        </div>
      )}

      <h3 className="font-bold text-lg mb-1">
        {submission.brand} {submission.model}
      </h3>
      <p className="text-sm text-gray-600 mb-2">{submission.description}</p>

      <div className="flex justify-between text-gray-700 text-sm mb-2">
        <span>Year: {submission.year}</span>
        <span>Price: Rs. {submission.price?.toLocaleString() || "N/A"}</span>
      </div>

      <div className="flex justify-between text-gray-700 text-sm mb-2">
        <span>Mileage: {submission.mileage || "N/A"} km</span>
        <span>Engine: {submission.engineCapacity || "N/A"} cc</span>
      </div>

      <div className="flex justify-between text-gray-700 text-sm mb-2">
        <span>Condition: {submission.condition}</span>
        <span>Owner: {submission.ownerName || "N/A"}</span>
      </div>

      <div className="text-gray-700 text-sm mb-2">
        Contact: {submission.ownerContact || "N/A"}
      </div>

      {/* Documents */}
      {submission.documents && submission.documents.length > 0 && (
        <div className="mb-2">
          <h4 className="font-medium text-gray-800 text-sm mb-1">Documents:</h4>
          <div className="flex gap-2 flex-wrap">
            {submission.documents.map((doc, idx) => (
              <a
                key={idx}
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline text-sm"
              >
                {doc.type}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Approve / Reject / Report Buttons */}
      <div className="flex gap-2 mt-2">
        {submission.status === "pending" && (
          <>
            <button
              onClick={() => onUpdateStatus(submission._id, "approved")}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Approve
            </button>
            <button
              onClick={() => onUpdateStatus(submission._id, "rejected")}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Reject
            </button>
          </>
        )}
        <button
          onClick={generateReport}
          className="px-3 py-1 bg-gray-700 text-white rounded text-sm"
        >
          Generate Report
        </button>
      </div>
    </motion.div>
  );
};

const AdminSubmissions = () => {
  const token = localStorage.getItem("token");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      alert("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const url =
        status === "approved"
          ? `http://localhost:5000/api/submissions/${id}/approve`
          : `http://localhost:5000/api/submissions/${id}/reject`;

      await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      setSubmissions((prev) =>
        prev.map((sub) => (sub._id === id ? { ...sub, status } : sub))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update submission status");
    }
  };

  const filteredSubmissions =
    filter === "all"
      ? submissions
      : submissions.filter((sub) => sub.status === filter);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  if (loading) return <div className="p-4">Loading submissions...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Submissions</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div>No submissions found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((sub) => (
            <AdminSubmissionCard
              key={sub._id}
              submission={sub}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSubmissions;
