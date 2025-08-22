import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const ViewLeadModel = ({ lead, admins, onClose }) => {
  if (!lead) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4">{lead.fullname || lead.name}</h2>
        <p>Email: {lead.email}</p>
        <p>Phone: {lead.phoneNumber || lead.phone}</p>
        <p>Type: {lead.userType || lead.type}</p>
        <p>Status: {lead.status}</p>
        <p>Assigned To: {typeof lead.assignedTo === 'object' ? lead.assignedTo.name : lead.assignedTo || 'Unassigned'}</p>
        {/* Add more lead info as needed */}
      </motion.div>
    </motion.div>
  );
};

export default ViewLeadModel;
