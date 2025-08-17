import React, { useEffect, useState } from "react";
import axios from "axios";

const AppliedJobs = ({ jobs }) => {
  const [jobDetails, setJobDetails] = useState({}); // store jobId -> job data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const details = {};
        for (const applied of jobs) {
          if (applied.jobId) {
            // fetch each job's details
            const res = await axios.get(`/api/jobs/${applied.jobId}`);
            details[applied.jobId] = res.data; // store in map
          }
        }
        setJobDetails(details);
      } catch (err) {
        console.error("Failed to fetch job details", err);
      } finally {
        setLoading(false);
      }
    };

    if (jobs?.length > 0) {
      fetchJobDetails();
    } else {
      setLoading(false);
    }
  }, [jobs]);

  if (loading) return <p>Loading applied jobs...</p>;
  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">📄 Applied Jobs</h2>
      <div className="space-y-4">
        {jobs.map((applied) => {
          const job = jobDetails[applied.jobId] || {};
          return (
            <div
              key={applied._id}
              className="bg-white bg-opacity-60 border border-gray-300 p-4 rounded-lg shadow-md"
            >
              <h3 className="text-lg font-bold">{job.title || "Unknown Job"}</h3>
              <p className="text-gray-600">{job.company || "Unknown Company"}</p>

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  Applied on: {new Date(applied.appliedAt).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    applied.status === "Applied"
                      ? "bg-blue-100 text-blue-800"
                      : applied.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {applied.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppliedJobs;
