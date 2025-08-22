import React from 'react';

const AgentView = ({ agent, admins }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{agent.companyName}</h2>

      <p><strong>Email:</strong> {agent.email}</p>
      <p><strong>Phone:</strong> {agent.phoneNumber}</p>
      <p><strong>Contact Person:</strong> {agent.contactPerson}</p>
      <p><strong>Address:</strong> {agent.companyAddress}</p>
      <p><strong>Status:</strong> {agent.status}</p>
      <p><strong>Priority:</strong> {agent.priority}</p>

      {agent.managedCandidates?.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Managed Candidates</h3>
          {agent.managedCandidates.map(candidate => (
            <div key={candidate._id} className="border rounded-lg p-3 mb-2">
              <p><strong>Name:</strong> {candidate.name}</p>
              <p><strong>Email:</strong> {candidate.email}</p>
              <p><strong>Phone:</strong> {candidate.phone}</p>
              <p><strong>Status:</strong> {candidate.status}</p>
              {candidate.skills?.length > 0 && <p><strong>Skills:</strong> {candidate.skills.join(', ')}</p>}
              {candidate.experience && <p><strong>Experience:</strong> {candidate.experience}</p>}
              {candidate.education?.length > 0 && (
                <p><strong>Education:</strong> {candidate.education.map(e => e.name || e.institution).join(', ')}</p>
              )}
              {candidate.documents?.length > 0 && (
                <ul className="list-disc list-inside">
                  {candidate.documents.map(doc => (
                    <li key={doc._id}>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {doc.type}: {doc.fileName} ({doc.status})
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentView;
