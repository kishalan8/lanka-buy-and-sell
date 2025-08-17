import { useState, useEffect } from 'react';
import axios from 'axios';

const ApplicationStatusOptions = ['Applied', 'Reviewed', 'Accepted', 'Rejected'];
const JOBS_PER_PAGE = 5;

const ApplicationsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedApplicant, setHighlightedApplicant] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/applications/all');
        setJobs(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleStatusChange = async (jobId, applicantId, newStatus) => {
    setUpdating(true);
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/applications/${jobId}/status`,
        { applicantId, status: newStatus }
      );

      // Update UI immediately
      setJobs(prev =>
        prev.map(job =>
          job._id === jobId
            ? {
                ...job,
                applicants: job.applicants.map(app =>
                  app._id === applicantId ? { ...app, status: data.applicant.status } : app
                ),
              }
            : job
        )
      );

      // Highlight the updated row
      setHighlightedApplicant(applicantId);
      setTimeout(() => setHighlightedApplicant(null), 2000); // highlight lasts 2s
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  if (loading) return <p className="p-6">Loading applications...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (jobs.length === 0) return <p className="p-6">No applications found.</p>;

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">All Job Applications</h1>

      {paginatedJobs.map(job => (
        <div key={job._id} className="mb-8 border rounded-lg p-5 bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-1">
            {job.title} @ {job.company}
          </h2>
          <p className="text-gray-600 mb-4">
            {job.location}, {job.country} | {job.type}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Applicant Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                  <th className="border px-4 py-2 text-center">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {job.applicants.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-gray-500">
                      No applicants yet.
                    </td>
                  </tr>
                ) : (
                  job.applicants.map(applicant => (
                    <tr
                      key={applicant._id}
                      className={`transition-colors duration-500 ${
                        highlightedApplicant === applicant._id
                          ? 'bg-green-100'
                          : 'bg-white'
                      }`}
                    >
                      <td className="border px-4 py-2">{applicant.userId?.name || 'Unknown'}</td>
                      <td className="border px-4 py-2">{applicant.userId?.email || 'Unknown'}</td>
                      <td className="border px-4 py-2">{applicant.status}</td>
                      <td className="border px-4 py-2 text-center">
                        <select
                          disabled={updating}
                          value={applicant.status}
                          onChange={e =>
                            handleStatusChange(job._id, applicant._id, e.target.value)
                          }
                          className="border rounded px-2 py-1 bg-white hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          {ApplicationStatusOptions.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === idx + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 hover:bg-blue-100'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
