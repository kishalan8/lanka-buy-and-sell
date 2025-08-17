// FILE: admin/src/pages/AddJob.jsx
import React, { useState } from "react";
import axios from "axios";

const AddJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    country: "",
    type: "Full-time",
    description: "",
    benefits: "",
    requirements: "",
    skills: "",
    salary: "",
    ageMin: 18,
    ageMax: 60,
    expiringAt: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const payload = {
        ...formData,
        benefits: formData.benefits
          ? formData.benefits.split(",").map((b) => b.trim())
          : [],
        requirements: formData.requirements
          ? formData.requirements.split(",").map((r) => r.trim())
          : [],
        skills: formData.skills
          ? formData.skills.split(",").map((s) => s.trim())
          : [],
        ageLimit: {
          min: Number(formData.ageMin),
          max: Number(formData.ageMax),
        },
        salary: formData.salary ? Number(formData.salary) : null,
      };

      await axios.post("http://localhost:5000/api/jobs", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Job created successfully ✅");
      setFormData({
        title: "",
        company: "",
        location: "",
        country: "",
        type: "Full-time",
        description: "",
        benefits: "",
        requirements: "",
        skills: "",
        salary: "",
        ageMin: 18,
        ageMax: 60,
        expiringAt: "",
      });
    } catch (err) {
      console.error("Error creating job:", err);
      alert(err.response?.data?.message || "Error creating job ❌");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add Job</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          {["Full-time", "Part-time", "Contract", "Internship", "Remote"].map(
            (t) => (
              <option key={t} value={t}>
                {t}
              </option>
            )
          )}
        </select>
        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="ageMin"
          placeholder="Min Age"
          value={formData.ageMin}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="ageMax"
          placeholder="Max Age"
          value={formData.ageMax}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="expiringAt"
          value={formData.expiringAt}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="border p-2 rounded col-span-2"
        />
        <input
          type="text"
          name="benefits"
          placeholder="Benefits (comma separated)"
          value={formData.benefits}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
        <input
          type="text"
          name="requirements"
          placeholder="Requirements (comma separated)"
          value={formData.requirements}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma separated)"
          value={formData.skills}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Add Job
        </button>
      </form>
    </div>
  );
};

export default AddJob;
