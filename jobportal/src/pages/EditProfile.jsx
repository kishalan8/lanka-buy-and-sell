import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Book, Phone, MapPin, Briefcase, Calendar, FileText, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const jobCategoryOptions = [
  "Accounting",
  "Human Resource",
  "Marketing",
  "Project Management",
  "Software Development",
  "Data Science",
  "CyberSecurity",
  "Graphic Design",
];

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = res.data;
        // Ensure social fields are strings
        profile.social = {
          linkedin: profile.social?.linkedin || "",
          github: profile.social?.github || "",
          twitter: profile.social?.twitter || "",
          portfolio: profile.social?.portfolio || "",
        };
        setUser(profile);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (key, value) => {
    setUser({ ...user, [key]: value });
  };

  const handleSocialChange = (platform, value) => {
    setUser({ ...user, social: { ...user.social, [platform]: value } });
  };

  const handleJobCategoriesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setUser({ ...user, jobCategories: selected });
  };

  const handleFileChange = (key, file) => {
    setUser({ ...user, [key]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.keys(user).forEach((key) => {
        if (key === "social" || key === "jobCategories") {
          formData.append(key, JSON.stringify(user[key]));
        } else if (key === "CV" || key === "picture") {
          if (user[key] instanceof File) formData.append(key, user[key]);
        } else {
          formData.append(key, user[key] || "");
        }
      });

      await axios.put("/api/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );

  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-8">
      <motion.div>
        <h1 className="text-heading-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent text-center md:text-left">
          Edit Profile
        </h1>
        <motion.div
          className="h-1 w-24 rounded-full mt-3 mx-auto md:mx-0"
          style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.div>

      {/* Profile Fields */}
      <div className="lg:bg-white/70 lg:backdrop-blur-xl rounded-3xl lg:border lg:border-white/30 lg:shadow-2xl overflow-hidden">
        <div className="relative z-10 mx-auto py-3 lg:mx-0 lg:p-8 space-y-4">
          {/* Picture Upload */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 flex items-center justify-center overflow-hidden shadow-xl">
              {user.picture && !(user.picture instanceof File) ? (
                <img
                  src={
                    user.picture.startsWith("http")
                      ? user.picture
                      : `http://localhost:5000/${user.picture}`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-600" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("picture", e.target.files[0])}
              className="md:w-60"
            />
          </div>

          {/* All Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-2">
            <Field label="Full Name" value={user.name} onChange={(v) => handleChange("name", v)} />
            <Field label="Email" value={user.email} onChange={(v) => handleChange("email", v)} type="email" />
            <Field label="Phone" value={user.phoneNumber} onChange={(v) => handleChange("phoneNumber", v)} type="tel" />
            <Field label="Address" value={user.address} onChange={(v) => handleChange("address", v)} />
            <Field label="Country" value={user.country} onChange={(v) => handleChange("country", v)} />
            <Field label="Job Title" value={user.jobTitle} onChange={(v) => handleChange("jobTitle", v)} />
            
            {/* Job Categories */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl bg-gray-50/50 border border-gray-200/50">
              <div className="flex items-center gap-3 md:w-1/3">
                <div className="p-2 md:p-3 rounded-xl bg-gray-100">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                </div>
                <label className="block text-sm text-muted-light">Job Categories</label>
              </div>
              <select
                multiple
                value={user.jobCategories}
                onChange={handleJobCategoriesChange}
                className="flex-1 p-2 border rounded-lg"
              >
                {jobCategoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Social Links */}
            <Field label="LinkedIn" value={user.social.linkedin} onChange={(v) => handleSocialChange("linkedin", v)} />
            <Field label="GitHub" value={user.social.github} onChange={(v) => handleSocialChange("github", v)} />
            <Field label="Twitter" value={user.social.twitter} onChange={(v) => handleSocialChange("twitter", v)} />
            <Field label="Portfolio" value={user.social.portfolio} onChange={(v) => handleSocialChange("portfolio", v)} />

            {/* CV Upload */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl bg-gray-50/50 border border-gray-200/50">
              <div className="flex items-center gap-3 md:w-1/3">
                <div className="p-2 md:p-3 rounded-xl bg-gray-100">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <label className="block text-sm text-muted-light">Resume (CV)</label>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange("CV", e.target.files[0])}
                className="flex-1 p-2 border rounded-lg"
              />
            </div>

          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-lg flex items-center gap-2 mt-4"
          >
            <Edit3 className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </motion.form>
  );
};

const Field = ({ label, value, onChange, type = "text" }) => (
  <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl bg-gray-50/50 border border-gray-200/50">
    <div className="flex items-center gap-3 md:w-1/3">
      <div className="p-2 md:p-3 rounded-xl bg-gray-100">
        <Book className="w-5 h-5 text-gray-600" />
      </div>
      <label className="block text-sm text-muted-light">{label}</label>
    </div>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 p-2 border rounded-lg"
    />
  </div>
);

export default EditProfile;
