import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const CandidatePage = () => {
  const token = localStorage.getItem("token");
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [agentFilter, setAgentFilter] = useState("All");

  // Fetch all candidates from all agents
  const fetchAllManagedCandidates = async () => {
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/agent/candidate", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCandidates(res.data.data);
      setFilteredCandidates(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching managed candidates:", err);
      toast.error("Failed to fetch managed candidates");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllManagedCandidates();
  }, []);

  // Filter & search
  useEffect(() => {
    let temp = [...candidates];

    if (agentFilter !== "All") {
      temp = temp.filter(c => c.agentName === agentFilter);
    }

    if (searchQuery.trim()) {
      temp = temp.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCandidates(temp);
  }, [searchQuery, agentFilter, candidates]);

  // Update candidate status
  const updateCandidateStatus = async (agentId, candidateId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/agent/candidate/${agentId}/${candidateId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Status updated successfully");
      fetchAllManagedCandidates(); // refresh data
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  // Unique agents for filter
  const agents = Array.from(new Set(candidates.map(c => c.agentName)));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">All Managed Candidates</h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <select
          className="p-2 rounded-lg border"
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
        >
          <option value="All">All Agents</option>
          {agents.map(agent => (
            <option key={agent} value={agent}>{agent}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredCandidates.length === 0 ? (
        <p className="text-gray-500">No managed candidates found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Skills</th>
                <th className="px-4 py-2">Experience</th>
                <th className="px-4 py-2">Qualifications</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Documents</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredCandidates.map(candidate => (
                  <motion.tr
                    key={candidate._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border-t border-gray-200"
                  >
                    <td className="px-4 py-2">{candidate.name}</td>
                    <td className="px-4 py-2">{candidate.email}</td>
                    <td className="px-4 py-2">{candidate.phone}</td>
                    <td className="px-4 py-2">{candidate.skills?.join(", ")}</td>
                    <td className="px-4 py-2">{candidate.experience}</td>
                    <td className="px-4 py-2">{candidate.qualifications?.join(", ")}</td>
                    <td className="px-4 py-2">{candidate.agentName}</td>
                    <td className="px-4 py-2">{candidate.agentCompany}</td>
                    <td className="px-4 py-2">
                      <select
                        className="p-1 rounded border"
                        value={candidate.status || "Pending"}
                        onChange={(e) =>
                          updateCandidateStatus(candidate.agentId, candidate._id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      {candidate.documents?.map(doc => (
                        <div key={doc._id}>
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            {doc.type}
                          </a>
                        </div>
                      )) || <span className="text-gray-400">No documents</span>}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CandidatePage;
