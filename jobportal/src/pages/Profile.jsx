import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AppliedJobs from "../components/AppliedJobs"; 

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-blue-500 font-semibold">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold mt-10">
        {error}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex justify-center items-center px-4"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgb(5, 26, 83), rgb(2, 41, 96), rgb(235, 237, 241))",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="bg-white bg-opacity-30 backdrop-blur-lg border border-gray-200 max-w-2xl w-full p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          👤 My Account
        </h1>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          {user.picture ? (
            <img
              src={getProfilePictureUrl()}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl">
              No Image
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="space-y-4 text-gray-800">
          <div>
            <strong>Full Name: </strong> {user.name}
          </div>
          <div>
            <strong>First Name: </strong> {user.firstname}
          </div>
          <div>
            <strong>Last Name: </strong> {user.lastname}
          </div>
          <div>
            <strong>Email: </strong> {user.email}
          </div>
          <div>
            <strong>Address: </strong> {user.address || "Not provided"}
          </div>
          <div>
            <strong>Country: </strong> {user.country || "Not provided"}
          </div>
          <div>
            <strong>Phone Number: </strong> {user.phoneNumber || "Not provided"}
          </div>
          <div>
            <strong>Resume: </strong>{" "}
            {user.CV ? (
              <a
                href={
                  user.CV.startsWith("http")
                    ? user.CV
                    : `http://localhost:5000/${user.CV}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View CV
              </a>
            ) : (
              "No CV uploaded"
            )}
          </div>
        </div>

        {/* ✅ Applied Jobs Component */}
        <AppliedJobs jobs={user.appliedJobs} />

        {/* Edit Profile Button */}
        <div className="mt-8 text-center">
          <Link
            to="/edit-profile"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
