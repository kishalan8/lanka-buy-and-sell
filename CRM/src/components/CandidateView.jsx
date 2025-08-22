import React from 'react';

const CandidateView = ({ candidate }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{candidate.name}</h2>

      <p><strong>Email:</strong> {candidate.email}</p>
      <p><strong>Phone:</strong> {candidate.phoneNumber}</p>
      <p><strong>Status:</strong> {candidate.status}</p>
      <p><strong>Priority:</strong> {candidate.priority}</p>

      {candidate.skills?.length > 0 && <p><strong>Skills:</strong> {candidate.skills.join(', ')}</p>}
      {candidate.experience && <p><strong>Experience:</strong> {candidate.experience}</p>}
      {candidate.education?.length > 0 && (
        <div>
          <strong>Education:</strong>
          <ul className="list-disc list-inside">
            {candidate.education.map(edu => (
              <li key={edu._id}>{edu.name || edu.institution} {edu.period ? `(${edu.period})` : ''}</li>
            ))}
          </ul>
        </div>
      )}

      {candidate.documents?.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4 mb-2">Documents</h3>
          <ul className="list-disc list-inside">
            {candidate.documents.map(doc => (
              <li key={doc._id}>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {doc.type}: {doc.fileName} ({doc.status})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {candidate.appliedJobs?.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Applied Jobs</h3>
          <ul className="list-disc list-inside">
            {candidate.appliedJobs.map(job => (
              <li key={job._id}>{job.jobId} - {job.status}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CandidateView;
