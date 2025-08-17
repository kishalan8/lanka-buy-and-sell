import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, MapPin, Phone, FileText, ImagePlus, Building2, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const { signup, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [userType, setUserType] = useState('candidate'); // 'candidate' or 'agent'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    country: '',
    phoneNumber: '',
    companyName: '',
    companyAddress: '',
  });

  const [photo, setPhoto] = useState(null);
  const [CV, setCV] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);

  const photoInputRef = useRef(null);
  const cvInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'photo') setPhoto(files[0]);
    if (name === 'CV') setCV(files[0]);
    if (name === 'companyLogo') setCompanyLogo(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('userType', userType);

    if (userType === 'candidate') {
      data.append('address', formData.address);
      data.append('country', formData.country);
      data.append('phoneNumber', formData.phoneNumber);
      if (photo) data.append('photo', photo);
      if (CV) data.append('CV', CV);
    } else {
      data.append('companyName', formData.companyName);
      data.append('companyAddress', formData.companyAddress);
      data.append('contactPerson', formData.name);
      data.append('phoneNumber', formData.phoneNumber);
      if (companyLogo) data.append('companyLogo', companyLogo);
    }

    try {
      await signup(data);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-soft">
      <motion.div className="w-full max-w-lg lg:max-w-xl bg-white/50 border border-gray-200 rounded-3xl shadow-2xl backdrop-blur-lg overflow-hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="p-8 lg:p-12">
          <div className="mb-8 text-center">
            <motion.h1 className="text-heading-lg text-gray-800">Create an Account</motion.h1>
            <motion.p className="text-muted-dark mt-2">Join us and find your next opportunity or hire your next star.</motion.p>
          </div>

          <motion.div className="flex gap-4 mb-8 justify-center">
            <motion.button type="button" onClick={() => setUserType('candidate')}
              className={`flex-1 p-3 rounded-xl font-semibold ${userType==='candidate'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`}>
              <User className="inline-block mr-2" /> Candidate
            </motion.button>
            <motion.button type="button" onClick={() => setUserType('agent')}
              className={`flex-1 p-3 rounded-xl font-semibold ${userType==='agent'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`}>
              <Building2 className="inline-block mr-2" /> Agent
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {error && <motion.div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <X className="h-5 w-5" />
              <span>{error}</span>
            </motion.div>}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common fields */}
            <div className="relative">
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required
                     className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="relative">
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required
                     className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="relative">
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required
                     className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="relative">
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required
                     className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {userType === 'candidate' && (
              <>
                <div className="relative">
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <div className="relative">
                  <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo (Optional)</label>
                  <button type="button" onClick={() => photoInputRef.current.click()} className="flex-1 py-3 px-4 bg-white/50 border border-gray-200 rounded-xl flex items-center justify-center gap-2">
                    <ImagePlus className="w-5 h-5" /> {photo ? photo.name : 'Upload Photo'}
                  </button>
                  <input type="file" name="photo" ref={photoInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>

                {/* CV */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload CV (Optional)</label>
                  <button type="button" onClick={() => cvInputRef.current.click()} className="flex-1 py-3 px-4 bg-white/50 border border-gray-200 rounded-xl flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" /> {CV ? CV.name : 'Upload CV'}
                  </button>
                  <input type="file" name="CV" ref={cvInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" />
                </div>
              </>
            )}

            {userType === 'agent' && (
              <>
                <div className="relative">
                  <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} required
                         className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <div className="relative">
                  <input type="text" name="companyAddress" placeholder="Company Address" value={formData.companyAddress} onChange={handleChange} required
                         className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <div className="relative">
                  <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange}
                         className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

                {/* Company Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo (Optional)</label>
                  <button type="button" onClick={() => logoInputRef.current.click()} className="flex-1 py-3 px-4 bg-white/50 border border-gray-200 rounded-xl flex items-center justify-center gap-2">
                    <ImagePlus className="w-5 h-5" /> {companyLogo ? companyLogo.name : 'Upload Logo'}
                  </button>
                  <input type="file" name="companyLogo" ref={logoInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
              {loading ? 'Processing...' : 'Sign Up'} <UserPlus className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-dark">
            Already have an account? <Link to="/login" className="text-blue-700 font-medium hover:underline">Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
