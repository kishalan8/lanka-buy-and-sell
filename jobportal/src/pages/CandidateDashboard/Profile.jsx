import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Edit3,
  Camera,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Save,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Initialize formData properly to avoid undefined errors
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    country: "",
    CV: "",
    picture:null
  });

  const [originalFormData, setOriginalFormData] = useState({ ...formData });

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(res.data);

        const userData = {
          name: res.data.name || "",
          email: res.data.email || "",
          phoneNumber: res.data.phoneNumber || "",
          address: res.data.address || "",
          country: res.data.country || "",
          CV: res.data.CV || "",
          picture: res.data.picture || null
        };

        setFormData(userData);
        setOriginalFormData(userData);
        setLoading(false);

      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to load profile");
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const getProfilePictureUrl = () => {
    if (!user?.picture) return null;
    if (user.picture.startsWith("http")) return user.picture;
    return `http://localhost:5000/${user.picture}`;
  };

  const profileFields = [
    { key: "name", label: "Full Name", icon: User },
    { key: "email", label: "Email", icon: Mail },
    { key: "phoneNumber", label: "Phone Number", icon: Phone },
    { key: "address", label: "Address", icon: MapPin },
    { key: "country", label: "Country", icon: MapPin },
    { key: "CV", label: "Resume", icon: FileText },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setFormData(prev => ({ ...prev, CV: file.name }));
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();
  const triggerResumeInput = () => resumeInputRef.current.click();

  const handleInputChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key !== "CV") formDataToSend.append(key, formData[key]);
      });

      if (pictureFile) formDataToSend.append("picture", pictureFile);
      if (resumeFile) formDataToSend.append("CV", resumeFile);

      const res = await axios.put("/api/users/profile", formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setUser(prev => ({ ...prev, ...res.data, picture: res.data.picture || prev.picture, CV: res.data.CV || prev.CV }));
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      setOriginalFormData(formData);
      setIsEditing(false);
      setPictureFile(null);
      setResumeFile(null);
      setUploadProgress(0);

    } catch (error) {
      console.error("Failed to save profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div></div>;
  if (error) return <div className="text-center text-red-600 font-semibold mt-10">{error}</div>;

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-heading-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent text-center md:text-left">My Profile</h1>
        <motion.div className="h-1 w-24 rounded-full mt-3 mx-auto md:mx-0" style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }} initial={{ width: 0 }} animate={{ width: 96 }} transition={{ delay: 0.5, duration: 0.8 }} />
      </motion.div>

      {/* Main Profile Card */}
      <motion.div variants={itemVariants} className="lg:bg-white/70 lg:backdrop-blur-xl rounded-3xl lg:border lg:border-white/30 lg:shadow-2xl overflow-hidden relative">
        <div className="relative z-10 mx-auto py-3 lg:mx-0 lg:p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start gap-6 mb-8">
            <motion.div className="relative group" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center overflow-hidden shadow-xl">
                {(isEditing && profileImage) ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : user?.picture ? <img src={getProfilePictureUrl()} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-gray-600" />}
              </div>
              {isEditing && <motion.button onClick={triggerFileInput} className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300" whileHover={{ scale: 1.1 }}><Camera className="w-6 h-6 text-white" /></motion.button>}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </motion.div>

            <div className="flex-1 md:text-left text-center">
              <motion.h2 className="text-2xl font-bold text-gray-800 mb-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>{user.name}</motion.h2>
              <motion.div className="flex items-center gap-2 text-sm text-gray-500" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}><Calendar className="w-4 h-4" /> Joined {joinDate}</motion.div>
            </div>

            <motion.button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-lg flex items-center gap-2 group relative overflow-hidden cursor-pointer mt-4 md:mt-0" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400 }}>
              <div className="relative z-10 flex items-center gap-2">
                <AnimatePresence mode="wait">
                  <motion.div key={isEditing ? "save" : "edit"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </motion.div>
                </AnimatePresence>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </div>
            </motion.button>
          </div>

          {/* Profile Fields */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-2" variants={containerVariants}>
            {profileFields.map((field) => (
              <motion.div key={field.key} variants={itemVariants} className="group relative">
                <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl bg-gray-50/50 border border-gray-200/50 group-hover:bg-white/80 group-hover:border-blue-200/50 group-hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <motion.div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-[var(--color-secondary)]/80 transition-all duration-300" whileHover={{ scale: window.innerWidth > 768 ? 1.1 : 1 }}>
                      <field.icon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-[var(--color-primary)] transition-colors" />
                    </motion.div>
                    <label className="block text-sm text-muted-light group-hover:text-gray-600 transition-colors">{field.label}</label>
                  </div>

                  {field.key === "CV" ? (
                    <div className="flex flex-col">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={triggerResumeInput} className="text-sm text-blue-600 hover:underline">
                            {resumeFile ? resumeFile.name : user?.CV ? "Replace Resume" : "Upload Resume"}
                          </button>
                          <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} accept=".pdf,.doc,.docx" className="hidden" />
                        </div>
                      ) : user?.CV ? (
                        <a href={user.CV.startsWith("http") ? user.CV : `http://localhost:5000/${user.CV}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View Resume</a>
                      ) : (
                        <span className="text-sm text-gray-500">No resume uploaded</span>
                      )}
                    </div>
                  ) : (
                    isEditing ? (
                      <motion.input type="text" value={formData[field.key]} onChange={(e) => handleInputChange(e, field.key)} className={`flex-1 bg-transparent text-sm font-medium focus:outline-none ${field.key === "email" ? "cursor-not-allowed text-gray-500 bg-gray-100 rounded px-2 py-1" : ""}`} readOnly={field.key === "email"} />
                    ) : (
                      <span className="text-md font-semibold text-gray-700">{formData[field.key]}</span>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Cancel Button */}
          <AnimatePresence>
            {isEditing && (
              <motion.div className="flex gap-4 mt-8 pt-6 border-t justify-center border-gray-200" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <motion.button onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg " whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>Save Changes</motion.button>
                <motion.button onClick={() => { setFormData(originalFormData); setIsEditing(false); }} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><X className="w-5 h-5" /></motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
