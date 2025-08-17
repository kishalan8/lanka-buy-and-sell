import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Edit3, Trash2, Eye, FileText, Phone, Mail, User, X, Save, Upload
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const ManagedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // Info / Documents

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', skills: '', experience: '',
    address: '', qualifications: '', cv: null, passport: null, picture: null, drivingLicense: null
  });

  useEffect(() => { fetchCandidates(); }, []);

  useEffect(() => {
    const filtered = candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone?.includes(searchTerm)
    );
    setFilteredCandidates(filtered);
  }, [candidates, searchTerm]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/agent/candidates');
      if (data.success) setCandidates(data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch candidates');
    } finally { setLoading(false); }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') submitData.append(key, formData[key]);
      });

      let response;
      if (editingCandidate) {
        response = await axios.put(`/api/agent/candidates/${editingCandidate._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post('/api/agent/candidates', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        await fetchCandidates();
        resetForm();
        toast.success(editingCandidate ? 'Candidate updated!' : 'Candidate added!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save candidate');
    } finally { setLoading(false); }
  };

  const handleEdit = candidate => {
    setFormData({
      name: candidate.name, email: candidate.email, phone: candidate.phone,
      skills: Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills,
      experience: candidate.experience, address: candidate.address,
      qualifications: Array.isArray(candidate.qualifications) ? candidate.qualifications.join(', ') : candidate.qualifications,
      cv: null, passport: null, picture: null, drivingLicense: null
    });
    setEditingCandidate(candidate);
    setShowAddForm(true);
    setActiveTab('info');
  };

  const handleDelete = async candidateId => {
    if (window.confirm('Are you sure you want to remove this candidate?')) {
      try { await axios.delete(`/api/agent/candidates/${candidateId}`); await fetchCandidates(); toast.success('Deleted successfully!'); }
      catch (error) { console.error(error); toast.error('Failed to delete candidate'); }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', skills: '', experience: '',
      address: '', qualifications: '', cv: null, passport: null, picture: null, drivingLicense: null
    });
    setEditingCandidate(null);
    setShowAddForm(false);
    setActiveTab('info');
  };

  const formatDate = dateString => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  if (loading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Managed Candidates</h1>
          <p className="text-gray-600 mt-2">Manage candidates visiting your office</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" /> Add New Candidate
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Candidates List */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No matching candidates' : 'No candidates yet'}
          </h3>
          <p className="text-gray-500">{searchTerm ? 'Try different search criteria' : 'Add candidates to get started'}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCandidates.map((candidate, index) => (
            <motion.div key={candidate._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{candidate.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                        {candidate.email && <div className="flex items-center gap-1"><Mail className="w-4 h-4" />{candidate.email}</div>}
                        {candidate.phone && <div className="flex items-center gap-1"><Phone className="w-4 h-4" />{candidate.phone}</div>}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">Added {formatDate(candidate.addedAt)}</span>
                  </div>
                  {candidate.skills && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(candidate.skills) ? candidate.skills : candidate.skills.split(',')).map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{skill.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {candidate.experience && <p className="text-gray-600 text-sm mb-2"><span className="font-medium">Experience:</span> {candidate.experience}</p>}
                  {candidate.qualifications && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Qualifications:</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(candidate.qualifications) ? candidate.qualifications : candidate.qualifications.split(',')).map((q, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{q.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2">
                  <button onClick={() => setViewingCandidate(candidate)} className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button onClick={() => handleEdit(candidate)} className="flex items-center gap-2 px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(candidate._id)} className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Candidate Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              
              {/* Tabs */}
              <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('info')} className={`px-4 py-2 ${activeTab==='info'?'border-b-2 border-blue-600 font-semibold':''}`}>Info</button>
                <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 ${activeTab==='documents'?'border-b-2 border-blue-600 font-semibold':''}`}>Documents</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'info' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                        <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
                      <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications (comma-separated)</label>
                      <input type="text" name="qualifications" value={formData.qualifications} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}

                {activeTab === 'documents' && (
                  <>
                    {['cv','passport','picture','drivingLicense'].map(fileType => (
                      <div key={fileType}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{fileType.replace(/([A-Z])/g, ' $1')}</label>
                        <div className="flex items-center gap-2">
                          <input type="file" name={fileType} onChange={handleFileChange} accept={fileType==='picture'? 'image/*' : '.pdf,.doc,.docx'} className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                          <Upload className="w-5 h-5 text-gray-400" />
                        </div>
                        {formData[fileType] && fileType==='picture' && (
                          <img src={URL.createObjectURL(formData[fileType])} alt="Preview" className="w-20 h-20 object-cover rounded-md mt-2" />
                        )}
                        {formData[fileType] && fileType!=='picture' && (
                          <p className="text-sm text-gray-600 mt-1">{formData[fileType].name}</p>
                        )}
                      </div>
                    ))}
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    {loading ? 'Saving...' : (editingCandidate ? 'Update Candidate' : 'Add Candidate')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Candidate Modal */}
      <AnimatePresence>
        {viewingCandidate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingCandidate(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Candidate Details</h2>
                <button onClick={() => setViewingCandidate(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><p className="text-gray-800">{viewingCandidate.name}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><p className="text-gray-800">{viewingCandidate.email}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><p className="text-gray-800">{viewingCandidate.phone || 'Not provided'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Experience</label><p className="text-gray-800">{viewingCandidate.experience || 'Not provided'}</p></div>
                </div>
                {viewingCandidate.skills && <div><label className="block text-sm font-medium text-gray-700 mb-2">Skills</label><div className="flex flex-wrap gap-2">{(Array.isArray(viewingCandidate.skills)? viewingCandidate.skills : viewingCandidate.skills.split(',')).map((s,i)=><span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{s.trim()}</span>)}</div></div>}
                {viewingCandidate.qualifications && <div><label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label><div className="flex flex-wrap gap-2">{(Array.isArray(viewingCandidate.qualifications)? viewingCandidate.qualifications : viewingCandidate.qualifications.split(',')).map((q,i)=><span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{q.trim()}</span>)}</div></div>}
                {viewingCandidate.address && <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><p className="text-gray-800">{viewingCandidate.address}</p></div>}
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Added Date</label><p className="text-gray-800">{formatDate(viewingCandidate.addedAt)}</p></div>

                {viewingCandidate.documents && viewingCandidate.documents.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
                    <div className="flex flex-wrap gap-2">
                      {viewingCandidate.documents.map((doc, i) => (
                        doc.type === 'Picture' ? (
                          <img key={i} src={doc.fileUrl} alt={doc.type} className="w-20 h-20 object-cover rounded-md border" />
                        ) : (
                          <a key={i} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <FileText className="w-4 h-4" /> {doc.type}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManagedCandidates;
