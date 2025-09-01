import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Info, Plus } from "lucide-react";
import SubmissionModel from "../components/SubmissionModel"; // import the submission modal

const SubmissionCard = ({ submission }) => {
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

      {/* Images preview */}
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
        <span>
          Price: Rs.{" "}
          {submission.price
            ? submission.price.toLocaleString()
            : "Not specified"}
        </span>
      </div>

      {submission.documents && submission.documents.length > 0 && (
        <div className="mb-2">
          <h4 className="font-medium text-gray-800 text-sm mb-1">Documents:</h4>
          <div className="flex gap-2 flex-wrap">
            {submission.documents.map((doc, idx) => (
              <a
                key={idx}
                href={doc.fileUrl} // ✅ corrected
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

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-auto px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 text-sm"
      >
        <Info className="w-4 h-4" />
        View Details
      </motion.button>
    </motion.div>
  );
};

const SubmissionsPage = () => {
  const token = localStorage.getItem("token");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/submissions/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ use the "data" field from response
      setSubmissions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      alert("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSubmissions();
  }, [token]);

  if (loading) return <div className="p-4">Loading submissions...</div>;

  return (
    <div className="p-6">
      {/* Add Submission Button */}
      <div className="flex justify-end mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded"
        >
          <Plus className="w-4 h-4" />
          Add Submission
        </motion.button>
      </div>

      {submissions.length === 0 ? (
        <div>No submissions found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <SubmissionCard key={sub._id} submission={sub} />
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {isModalOpen && (
        <SubmissionModel
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          refreshSubmissions={fetchSubmissions}
        />
      )}
    </div>
  );
};

export default SubmissionsPage;
