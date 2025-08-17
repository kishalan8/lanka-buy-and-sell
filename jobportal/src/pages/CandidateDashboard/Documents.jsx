import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { 
  Upload, 
  FileText, 
  Camera, 
  User, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Plus
} from "lucide-react";

const documentTypes = [
  { 
    key: "photo", 
    label: "Profile Photo", 
    multiple: false, 
    accept: "image/*",
    icon: User,
    color: "from-blue-500 via-indigo-500 to-purple-500"
  },
  { 
    key: "passport", 
    label: "Passport Photo", 
    multiple: false, 
    accept: "image/*",
    icon: CreditCard,
    color: "from-green-500 via-emerald-500 to-teal-500"
  },
  { 
    key: "drivingLicense", 
    label: "Driving License", 
    multiple: false, 
    accept: "image/*",
    icon: CreditCard,
    color: "from-orange-500 via-red-500 to-pink-500"
  },
  { 
    key: "cv", 
    label: "CV(s)", 
    multiple: true, 
    accept: ".pdf,.doc,.docx",
    icon: FileText,
    color: "from-purple-500 via-violet-500 to-indigo-500"
  },
];

const Documents = () => {
  const { user, loading: authLoading } = useAuth();
  const [existing, setExisting] = useState({});
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch existing docs once user is known
  useEffect(() => {
    if (!user) return;
    const fetchDocs = async () => {
      try {
        const { data } = await axios.get("/api/users/documents");
        console.log("Fetched existing documents:", data);
        setExisting(data);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };
    fetchDocs();
  }, [user]);

  // Handle selection + previews
  const handleFileChange = (e, key) => {
    const picked = documentTypes.find(d => d.key === key);
    if (picked.multiple) {
      setFiles(f => ({ ...f, [key]: Array.from(e.target.files) }));
    } else {
      const file = e.target.files[0];
      setFiles(f => ({ ...f, [key]: file }));
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setPreviews(p => ({ ...p, [key]: reader.result }));
        reader.readAsDataURL(file);
      }
    }
  };

  // Submit multipart/form-data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const form = new FormData();
      documentTypes.forEach(({ key, multiple }) => {
        const val = files[key];
        if (!val) return;
        if (multiple) {
          val.forEach(file => form.append(key, file));
        } else {
          form.append(key, val);
        }
      });

      const res = await axios.post("/api/users/documents", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log('Upload response:', res.data);

      setMessage("Upload successful!");
      setFiles({});
      setPreviews({});
      setExisting(res.data.documents); 
    } catch (err) {
      console.error(err);
      setMessage("Upload failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => {
      setMessage("");
    }, 2000);

    return () => clearTimeout(timer); 
  }
}, [message]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  if (authLoading) return null;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg"
        >
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Please log in to manage your documents.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.h1 
            className="text-heading-lg text-center md:text-left font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2"
          >
            Document Upload
          </motion.h1>
          <motion.div 
            className="h-1 w-24 rounded-full mx-auto md:mx-0"
            style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            whileHover={{ 
              width: 120,
              background: "linear-gradient(90deg, #1B3890, #0F79C5, #8B5CF6)",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
            }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <motion.p 
            className="text-muted-dark mt-2 text-center md:text-left"
            whileHover={{ color: "#1B3890", x: 5 }}
            transition={{ duration: 0.2 }}
          >
            Upload and manage your important documents
          </motion.p>
        </motion.div>

        {/* Existing Documents Grid */}
        {Object.keys(existing).some(key => existing[key]?.length > 0) && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <motion.h2 
              className="text-2xl text-center md:text-left font-bold text-gray-800 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Your Existing Documents
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {documentTypes.map(({ key, label, icon: IconComponent, color }) => (
                <motion.div
                  key={key}
                  variants={itemVariants}
                  className="group relative"
                  whileHover={{ 
                    y: -8,
                    rotateX: 5,
                    rotateY: 2,
                    scale: 1.02,
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15), 0 0 30px rgba(59, 130, 246, 0.1)",
                    borderRadius: "1rem"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-300/60 shadow-lg p-6 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        whileHover={{ 
                          rotate: [0, -10, 10, -5, 0], 
                          scale: 1.15,
                          y: -2
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400,
                          damping: 12,
                          rotate: { duration: 0.6 }
                        }}
                        className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:shadow-xl`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`text-sm px-2 py-1 rounded-full ${
                          existing[key]?.length > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {existing[key]?.length || 0}
                      </motion.div>
                    </div>
                    
                    <motion.h3 
                      className="text-lg font-semibold text-gray-800 mb-2"
                      whileHover={{ 
                        color: "#1B3890",
                        x: 3
                      }}
                    >
                      {label}
                    </motion.h3>
                    
                    <div className="space-y-2">
                      {existing[key]?.length > 0 ? (
                        existing[key].map((doc, index) => (
                          <motion.div
                            key={doc._id}
                            whileHover={{ x: 5, scale: 1.02 }}
                            className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 hover:bg-blue-50/50 transition-colors"
                          >
                            {key === "cv" ? (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-2"
                              >
                                <FileText className="w-3 h-3" />
                                {label} #{index + 1}
                              </a>
                            ) : (
                              <motion.img
                                whileHover={{ scale: 1.1 }}
                                src={doc.url}
                                alt={label}
                                className="w-8 h-8 object-cover rounded-md border cursor-pointer"
                                onClick={() => window.open(doc.url, '_blank')}
                              />
                            )}
                            <Eye className="w-3 h-3 text-gray-400" />
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">None uploaded</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-300/60 shadow-lg py-5 px-5 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="p-3 rounded-xl bg-gradient-primary text-white shadow-lg"
            >
              <Upload className="w-6 h-6" />
            </motion.div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Upload New Documents</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {documentTypes.map(({ key, label, multiple, accept, icon: IconComponent, color }) => (
                <motion.div 
                  key={key} 
                  variants={itemVariants}
                  className="group"
                >
                  <motion.div
                    whileHover={{ 
                      y: -2,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                    }}
                    className="relative border-2 border-dashed border-gray-400/60 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white/60 to-gray-50/40 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white shadow-md`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </motion.div>
                      <label className="text-lg font-semibold text-gray-800">{label}</label>
                    </div>

                    {/* Preview for single files */}
                    {!multiple && previews[key] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4"
                      >
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          src={previews[key]}
                          alt="preview"
                          className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-md"
                        />
                      </motion.div>
                    )}

                    {/* File count for multiple files */}
                    {multiple && files[key]?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 flex items-center gap-2 text-sm text-blue-600"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{files[key].length} file{files[key].length !== 1 ? 's' : ''} selected</span>
                      </motion.div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <input
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        onChange={e => handleFileChange(e, key)}
                        disabled={loading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="flex items-center justify-center py-4 px-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-300 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300">
                        <motion.div
                          whileHover={{ y: -2 }}
                          className="flex items-center gap-2 text-gray-600 group-hover:text-[var(--color-secondary)]"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="font-medium">
                            {files[key] ? 'Change files' : 'Choose files'}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {accept.includes('image') ? 'Images only' : 'PDF, DOC, DOCX files'}
                      {multiple && ' (multiple files allowed)'}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { 
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
                } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className={`w-max px-3 py-4 rounded-2xl text-white font-semibold text-description-sm transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-primary shadow-lg"
                }`}
              >
                <motion.div
                  className="flex items-center justify-center gap-3"
                  animate={loading ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  {loading ? "Uploading…" : "Upload Documents"}
                </motion.div>
              </motion.button>
            </motion.div>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl font-medium w-max mx-auto ${
                    message.includes("successful") 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.includes("successful") ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Documents