import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const documentTypes = [
  { key: "photo",          label: "Profile Photo",    multiple: false, accept: "image/*" },
  { key: "passport",       label: "Passport Photo",   multiple: false, accept: "image/*" },
  { key: "drivingLicense", label: "Driving License",  multiple: false, accept: "image/*" },
  { key: "cv",             label: "CV(s)",            multiple: true,  accept: ".pdf,.doc,.docx" },
];

export default function DocumentUploadPage() {
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
      setExisting(res.data.documents); // directly set grouped docs
    } catch (err) {
      console.error(err);
      setMessage("Upload failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user) return <p className="text-center mt-8">Please log in to manage your documents.</p>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Documents</h1>

      {/* Existing uploads */}
      <div className="space-y-6 mb-8">
        {documentTypes.map(({ key, label }) => (
          <div key={key}>
            <p className="font-medium">{label}:</p>
            {existing[key]?.length > 0 ? (
              existing[key].map((doc, index) =>
                key === "cv" ? (
                  <a
                    key={doc._id}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline block truncate"
                  >
                    {label} #{index + 1}
                  </a>
                ) : (
                  <img
                    key={doc._id}
                    src={doc.url}
                    alt={label}
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                )
              )
            ) : (
              <span className="text-gray-500">None uploaded</span>
            )}
          </div>
        ))}
      </div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {documentTypes.map(({ key, label, multiple, accept }) => (
          <div key={key}>
            <label className="block font-medium mb-1">{label}</label>
            <div className="flex items-center gap-4">
              {!multiple && previews[key] && (
                <img
                  src={previews[key]}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-md border"
                />
              )}
              <input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={e => handleFileChange(e, key)}
                disabled={loading}
                className="block text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          }`}
        >
          {loading ? "Uploading…" : "Upload Documents"}
        </button>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("successful") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
