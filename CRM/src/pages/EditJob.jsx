import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    country: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    skills: '',
    salary: '',
    benefits: '',
    expiringAt: '',
    ageLimitMin: '',
    ageLimitMax: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BACKEND_URL = 'http://localhost:5000'; // full backend URL

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${BACKEND_URL}/api/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Job details API response:', data);

        setJobForm({
          title: data.title || '',
          company: data.company || '',
          location: data.location || '',
          country: data.country || '',
          type: data.type || 'Full-time',
          description: data.description || '',
          requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          salary: data.salary || '',
          benefits: Array.isArray(data.benefits) ? data.benefits.join('\n') : '',
          expiringAt: data.expiringAt ? data.expiringAt.split('T')[0] : '',
          ageLimitMin: data.ageLimit?.min ?? '',
          ageLimitMax: data.ageLimit?.max ?? '',
        });
      } catch (err) {
        console.error('Fetch job error:', err);
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to update a job.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...jobForm,
      requirements: jobForm.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
      skills: jobForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      benefits: jobForm.benefits.split('\n').map((b) => b.trim()).filter(Boolean),
      ageLimit: {
        min: Number(jobForm.ageLimitMin),
        max: Number(jobForm.ageLimitMax),
      },
    };

    try {
      await axios.put(`${BACKEND_URL}/api/jobs/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      alert('Job updated successfully!');

      // Navigate according to dashboard
      const currentPath = window.location.pathname;
      let basePath = '';
      if (currentPath.startsWith('/admin-dashboard')) basePath = '/admin-dashboard';
      else if (currentPath.startsWith('/sales-dashboard')) basePath = '/sales-dashboard';

      navigate(`${basePath}/viewjob`);
    } catch (err) {
      console.error('Update job error:', err);
      setError(err.response?.data?.message || 'Failed to update job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading job data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Edit Job</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="Title" name="title" value={jobForm.title} onChange={handleChange} required />
          <InputField label="Company" name="company" value={jobForm.company} onChange={handleChange} required />
          <InputField label="Location" name="location" value={jobForm.location} onChange={handleChange} />
          <InputField label="Country" name="country" value={jobForm.country} onChange={handleChange} />

          <div>
            <label className="block mb-1 font-medium">Type</label>
            <select
              name="type"
              value={jobForm.type}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Remote</option>
            </select>
          </div>

          <InputField label="Salary" name="salary" value={jobForm.salary} onChange={handleChange} />
          <InputField label="Skills (comma separated)" name="skills" value={jobForm.skills} onChange={handleChange} placeholder="JavaScript, React, Node.js" />

          <TextArea label="Description" name="description" value={jobForm.description} onChange={handleChange} rows={5} />
          <TextArea label="Requirements (one per line)" name="requirements" value={jobForm.requirements} onChange={handleChange} rows={4} />
          <TextArea label="Benefits (one per line)" name="benefits" value={jobForm.benefits} onChange={handleChange} rows={3} />

          <InputField label="Expiring Date" type="date" name="expiringAt" value={jobForm.expiringAt} onChange={handleChange} />

          <div className="flex gap-4">
            <InputField label="Min Age Limit" name="ageLimitMin" type="number" value={jobForm.ageLimitMin} onChange={handleChange} required />
            <InputField label="Max Age Limit" name="ageLimitMax" type="number" value={jobForm.ageLimitMax} onChange={handleChange} required />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Updating...' : 'Update Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ label, name, value, onChange, ...props }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input name={name} value={value} onChange={onChange} className="w-full border border-gray-300 p-2 rounded" {...props} />
  </div>
);

// Reusable TextArea Component
const TextArea = ({ label, name, value, onChange, rows, ...props }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <textarea name={name} value={value} onChange={onChange} rows={rows} className="w-full border border-gray-300 p-2 rounded" {...props} />
  </div>
);

export default EditJob;
