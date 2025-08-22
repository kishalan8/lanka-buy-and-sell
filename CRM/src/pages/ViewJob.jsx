import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewJob = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login.');

      const { data } = await axios.get('http://localhost:5000/api/jobs/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Fetched jobs:', data);

      if (Array.isArray(data)) {
        setJobs(data);
        setError('');
      } else {
        setJobs([]);
        setError('Unexpected response format from server.');
      }
    } catch (err) {
      console.error(err);
      setJobs([]);
      setError(err.response?.data?.message || err.message || 'Failed to fetch jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchJobs(); // Refresh job list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete the job.');
    }
  };

  // Handle edit
  // Handle edit
const handleEdit = (id) => {
  // Determine current dashboard from URL
  const currentPath = window.location.pathname;

  let basePath = '';
  if (currentPath.startsWith('/admin-dashboard')) {
    basePath = '/admin-dashboard';
  } else if (currentPath.startsWith('/sales-dashboard')) {
    basePath = '/sales-dashboard';
  }

  // Navigate to edit job page within the current dashboard
  navigate(`${basePath}/editjob/${id}`);
};


  return (
    <div className="flex flex-col bg-gray-100 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">
          Posted Jobs ({Array.isArray(jobs) ? jobs.length : 0})
        </h2>
      </div>

      {loading && <p className="text-blue-500">Loading jobs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4">
        {!loading && Array.isArray(jobs) && jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job._id}
              className="border border-gray-200 p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center bg-white shadow-sm"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-800">{job.title}</h3>
                <p className="text-gray-600">{job.company}</p>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-700">
                  <span>{job.location}</span>
                  <span>{job.type}</span>
                  <span className="text-blue-600 font-medium">Salary: {job.salary ?? 'N/A'}</span>
                  <span className="text-blue-600 font-medium">CandidateCost: {job.candidateCost ?? 'N/A'}</span>
                  <span className="text-blue-600 font-medium">AgentCost: {job.agentCost ?? 'N/A'}</span>
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  Posted: {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'N/A'}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  Expiry: {job.expiringAt ? new Date(job.expiringAt).toLocaleDateString() : 'N/A'}
                </div>

                <div className="mt-1 text-sm font-medium">
                  Applicants: {Array.isArray(job.applicants) ? job.applicants.length : 0}
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex gap-3">
                <button
                  onClick={() => handleEdit(job._id)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-4 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(job._id)}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && <p className="text-gray-500">No jobs posted yet.</p>
        )}
      </div>
    </div>
  );
};

export default ViewJob;
