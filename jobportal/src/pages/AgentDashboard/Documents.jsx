import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { 
  FileText, 
  User, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Eye,
  Plus
} from "lucide-react";

const documentTypes = [
  { key: "photo", label: "Profile Photo", multiple: false, accept: "image/*", icon: User, color: "from-blue-500 via-indigo-500 to-purple-500" },
  { key: "passport", label: "Passport Photo", multiple: false, accept: "image/*", icon: CreditCard, color: "from-green-500 via-emerald-500 to-teal-500" },
  { key: "drivingLicense", label: "Driving License", multiple: false, accept: "image/*", icon: CreditCard, color: "from-orange-500 via-red-500 to-pink-500" },
  { key: "cv", label: "CV(s)", multiple: true, accept: ".pdf,.doc,.docx", icon: FileText, color: "from-purple-500 via-violet-500 to-indigo-500" },
];

const Documents = () => {
  const { user, token, loading: authLoading } = useAuth();

  const [existing, setExisting] = useState({ photo: [], passport: [], drivingLicense: [], cv: [] });
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const normalize = arr => arr.map(doc => ({ ...doc, url: (doc.url || "").replace(/\\/g, "/") }));

  // Log auth info when it becomes available
  useEffect(() => {
    if (!authLoading) {
      console.log("Auth loaded. User:", user);
      console.log("Auth loaded. Token:", token);
    }
  }, [authLoading, user, token]);

  // Fetch existing documents
  useEffect(() => {
    if (!user || !token) return;

    const fetchDocs = async () => {
      console.log("Fetching documents for user:", user._id);
      try {
        const { data } = await axios.get("/api/documents", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Fetched existing documents:", data.documents);

        setExisting({
          photo: normalize(data.documents.photo || []),
          passport: normalize(data.documents.passport || []),
          drivingLicense: normalize(data.documents.drivingLicense || []),
          cv: normalize(data.documents.cv || []),
        });
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      }
    };

    fetchDocs();
  }, [user, token]);

  // Log whenever existing state changes
  useEffect(() => {
    console.log("Existing documents state updated:", existing);
  }, [existing]);

  // Handle file selection
  const handleFileChange = (e, key) => {
    console.log(`File change detected for ${key}`);
    const picked = documentTypes.find(d => d.key === key);
    if (!picked) return;

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

  // Submit files
  const handleSubmit = async e => {
    e.preventDefault();
    console.log("Submitting files:", files);
    setLoading(true);
    setMessage("");

    try {
      const form = new FormData();
      documentTypes.forEach(({ key, multiple }) => {
        const val = files[key];
        if (!val) return;
        if (multiple) val.forEach(file => form.append(key, file));
        else form.append(key, val);
      });

      const { data } = await axios.post("/api/documents", form, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });

      console.log("Upload response:", data);
      setMessage("Upload successful!");
      setFiles({});
      setPreviews({});
      setExisting({
        photo: normalize(data.documents.photo || []),
        passport: normalize(data.documents.passport || []),
        drivingLicense: normalize(data.documents.drivingLicense || []),
        cv: normalize(data.documents.cv || [])
      });

    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("Upload failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      console.log("Message set:", message);
      const timer = setTimeout(() => setMessage(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (authLoading) return <div>Loading auth context...</div>;
  if (!user) return <div>Please log in</div>;

  return (
    <div className="min-h-screen md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <motion.h1 className="text-heading-lg text-center md:text-left font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Document Upload
          </motion.h1>
          <motion.p className="text-muted-dark mt-2 text-center md:text-left">
            Upload and manage your important documents
          </motion.p>
        </motion.div>

        {/* Existing Documents */}
        <motion.div className="mb-12">
          <motion.h2 className="text-2xl text-center md:text-left font-bold text-gray-800 mb-6">
            Your Existing Documents
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documentTypes.map(({ key, label, icon: IconComponent, color }) => (
              <div key={key} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-300/60 shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className={`text-sm px-2 py-1 rounded-full ${existing[key]?.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {existing[key]?.length || 0}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{label}</h3>
                <div className="space-y-2">
                  {existing[key]?.length > 0 ? (
                    existing[key].map((doc, index) => (
                      <div key={doc._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 hover:bg-blue-50/50 transition-colors">
                        {key === "cv" ? (
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-2">
                            <FileText className="w-3 h-3" /> {label} #{index + 1}
                          </a>
                        ) : (
                          <img src={doc.url} alt={label} className="w-8 h-8 object-cover rounded-md border cursor-pointer" onClick={() => window.open(doc.url, "_blank")} />
                        )}
                        <Eye className="w-3 h-3 text-gray-400" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">None uploaded</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upload Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-300/60 shadow-lg py-5 px-5 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Upload New Documents</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {documentTypes.map(({ key, label, multiple, accept, icon: IconComponent, color }) => (
                <div key={key} className="group relative border-2 border-dashed border-gray-400/60 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white/60 to-gray-50/40 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white shadow-md`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <label className="text-lg font-semibold text-gray-800">{label}</label>
                  </div>

                  {!multiple && previews[key] && (
                    <img src={previews[key]} alt="preview" className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-md mb-4" />
                  )}

                  {multiple && files[key]?.length > 0 && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-blue-600">
                      <FileText className="w-4 h-4" />
                      <span>{files[key].length} file{files[key].length !== 1 ? 's' : ''} selected</span>
                    </div>
                  )}

                  <input type="file" accept={accept} multiple={multiple} onChange={e => handleFileChange(e, key)} disabled={loading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />

                  <div className="flex items-center justify-center py-4 px-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-300 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Plus className="w-5 h-5" />
                      <span className="font-medium">{files[key] ? 'Change files' : 'Choose files'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {accept.includes('image') ? 'Images only' : 'PDF, DOC, DOCX files'}
                    {multiple && ' (multiple files allowed)'}
                  </p>
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className={`w-max px-3 py-4 rounded-2xl text-white font-semibold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-primary shadow-lg"}`}>
              {loading ? "Uploading…" : "Upload Documents"}
            </button>
          </form>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl font-medium w-max mx-auto mt-4 ${message.includes("successful") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
              >
                {message.includes("successful") ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Documents;
