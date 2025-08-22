import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Book, Phone, MapPin, Briefcase, Calendar, FileText, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 font-semibold mt-10">
        {error}
      </div>
    );

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const profileFields = [
    { key: "name", label: "Full Name", icon: User },
    { key: "email", label: "Email", icon: Mail },
    { key: "dob", label: "Date of Birth", icon: Calendar },
    { key: "gender", label: "Gender", icon: Mail },
    { key: "phoneNumber", label: "Phone Number", icon: Phone },
    { key: "address", label: "Address", icon: MapPin },
    { key: "country", label: "Country", icon: MapPin },
    { key: "skills", label: "Skills", icon: Briefcase },
    { key: "experience", label: "Experience", icon: Briefcase },
    { key: "jobTitle", label: "Job Title", icon: Briefcase },
    { key: "jobCategories", label: "Job Categories", icon: Briefcase },
    { key: "aboutMe", label: "About Me", icon: Mail },
    { key: "education", label: "Education", icon: Book },
    { key: "social", label: "Social", icon: Book },
    { key: "CV", label: "Resume", icon: FileText },
  ];

  const renderFieldValue = (field) => {
    const value = user[field.key];

    if (field.key === "CV") {
      return value ? (
        <a
          href={value.startsWith("http") ? value : `http://localhost:5000/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          View Resume
        </a>
      ) : (
        <span className="text-sm text-gray-500">No resume uploaded</span>
      );
    }

    if (Array.isArray(value)) {
      if (field.key === "education") {
        return value.length > 0 ? (
          value.map((edu, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              {edu.name} | {edu.institution} | {edu.period}
            </div>
          ))
        ) : (
          <span className="text-sm text-gray-500">No education added</span>
        );
      }

      if (field.key === "social") {
        return value.length > 0 ? (
          value.map((soc, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              {soc.platform} | {soc.url}
            </div>
          ))
        ) : (
          <span className="text-sm text-gray-500">No social added</span>
        );
      }

      return value.length > 0 ? value.join(", ") : <span className="text-sm text-gray-500">Not provided</span>;
    }

    return value || <span className="text-sm text-gray-500">Not provided</span>;
  };

  return (
    <motion.div className="space-y-8">
      {/* Header */}
      <motion.div>
        <h1 className="text-heading-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent text-center md:text-left">
          My Profile
        </h1>
        <motion.div
          className="h-1 w-24 rounded-full mt-3 mx-auto md:mx-0"
          style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.div>

      {/* Profile Card */}
      <motion.div className="lg:bg-white/70 lg:backdrop-blur-xl rounded-3xl lg:border lg:border-white/30 lg:shadow-2xl overflow-hidden relative">
        <div className="relative z-10 mx-auto py-3 lg:mx-0 lg:p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center overflow-hidden shadow-xl">
              {user?.picture ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-600" />
              )}
            </div>

            <div className="flex-1 md:text-left text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" /> Joined {joinDate}
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => navigate("/edit-profile")}
              className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-lg flex items-center gap-2 group relative overflow-hidden mt-4 md:mt-0"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-2">
            {profileFields.map((field) => (
              <div
                key={field.key}
                className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl bg-gray-50/50 border border-gray-200/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                    <field.icon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </div>
                  <label className="block text-sm text-muted-light">{field.label}</label>
                </div>
                <div className="flex-1">{renderFieldValue(field)}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
