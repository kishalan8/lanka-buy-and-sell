import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, User, Briefcase, Mail, Phone, Calendar, MapPin, Clock, Edit2, Plus, MessageSquare, FileText, Globe, Home, CheckCircle, Send, PhoneCall, ScrollText } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import EditClientModal from "../components/EditClientModal";

const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([
    {
      id: 1,
      content: 'Initial consultation completed. Client interested in Express Entry program for Canada.',
      author: 'Sarah Johnson',
      date: '2023-06-15',
      time: '10:30 AM'
    },
    {
      id: 2,
      content: 'Submitted all required documents for skills assessment. Waiting for approval.',
      author: 'Sarah Johnson',
      date: '2023-06-22',
      time: '2:15 PM'
    }
  ]);
  const [newNote, setNewNote] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);

  const client = {
    id: 1,
    name: 'James Wilson',
    type: 'Customer',
    profession: 'Software Engineer',
    status: 'Active',
    country: 'Canada',
    email: 'james.wilson@email.com',
    phone: '+1 (416) 123-4567',
    visaStatus: 'PR Processing',
    lastActivity: '2023-06-28',
    applications: 3,
    location: 'Toronto, ON',
    source: 'Referral',
    created: '2023-06-01',
    consultant: 'Sarah Johnson'
  };

  const handleBack = () => {
    navigate('/dashboard/clients');
  };

  const handleEdit = () => {
    setCurrentClient(client);
    setIsEditModalOpen(true);
  };

  const handleSaveClient = (updatedClient) => {
    // API call
    console.log("Client updated:", updatedClient);
    alert(`Client ${updatedClient.name} has been updated successfully!`);
    setIsEditModalOpen(false);
  };

  const handleAddNote = () => {
    if (newNote.trim() === '') return;

    const note = {
      id: notes.length + 1,
      content: newNote,
      author: 'You',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setNotes([note, ...notes]);
    setNewNote('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Inactive': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getVisaStatusColor = (visaStatus) => {
    switch (visaStatus) {
      case 'PR Approved': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'PR Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Work Visa': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'Assessment': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const timelineEvents = [
    {
      id: 1,
      type: 'creation',
      date: client.created,
      title: 'Client Onboarded',
      description: 'Client signed agreement and started migration process',
      icon: <User size={16} className="text-blue-500" />
    },
    {
      id: 2,
      type: 'assessment',
      date: '2023-06-10',
      title: 'Skills Assessment',
      description: 'Submitted documents for professional skills evaluation',
      icon: <FileText size={16} className="text-green-500" />
    },
    {
      id: 3,
      type: 'application',
      date: client.lastActivity,
      title: 'PR Application',
      description: 'Submitted permanent residency application to IRCC',
      icon: <Globe size={16} className="text-purple-500" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto"
      >
        {/* Header with back button */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4"
        >
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer "
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Back to Clients</span>
          </motion.button>

          <div className="flex gap-3 mx-auto sm:mx-0 md:w-auto">
            <motion.button
              onClick={handleEdit}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold text-description-sm shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-primary cursor-pointer"
            >
              <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span>Edit Client</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Client Summary Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-4 sm:p-8 mb-8 overflow-hidden relative"
        >
          {/* Background deco */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5 overflow-hidden blur-xl">
            <div
              className="w-full h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #1B3890, #0F79C5)'
              }}
            ></div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
                <motion.div
                  className={`p-4 rounded-2xl ${client.type === 'Customer' ? 'bg-blue-100' : 'bg-indigo-100'} shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {client.type === 'Customer' ? (
                    <User className={`h-10 w-10 ${client.type === 'Customer' ? 'text-blue-600' : 'text-indigo-600'}`} />
                  ) : (
                    <Briefcase className="h-12 w-12 text-indigo-600" />
                  )}
                </motion.div>

                <div className="flex-1">
                   <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 mb-4 text-center sm:text-left">
                    <div>
                      <motion.h1
                        className="text-heading-lg  text-gray-900 mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {client.name}
                      </motion.h1>
                      <motion.p
                        className="text-lg text-muted-dark font-medium"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {client.profession}
                      </motion.p>
                    </div>

                    <div className="flex justify-center flex-wrap gap-3">
                      <motion.span
                        className={`px-4 py-2 text-sm font-semibold rounded-full border shadow-sm ${getVisaStatusColor(client.visaStatus)}`}
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        {client.visaStatus}
                      </motion.span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                      { icon: Mail, label: 'Email', value: client.email, color: 'text-blue-500' },
                      { icon: Phone, label: 'Phone', value: client.phone, color: 'text-green-500' },
                      { icon: MapPin, label: 'Location', value: client.location, color: 'text-red-500' },
                      { icon: ScrollText, label: 'Applications', value: `${client.applications} Active`, color: 'text-purple-500' }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="flex items-center gap-2 p-3 bg-white/60 rounded-xl border border-white/30 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <div className={`p-1 rounded-lg bg-gray-100 ${item.color}`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-dark font-medium">{item.label}</p>
                          <p className="text-gray-700 font-semibold truncate text-sm">{item.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Timeline & Notes */}
          <div className="xl:col-span-2 space-y-8">
            {/* Timeline Section */}
            <motion.div
              variants={itemVariants}
     className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 overflow-hidden relative"
            >
              <motion.h2
                  className="text-lg sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="p-2 rounded-xl bg-blue-100">
                  <Calendar className="text-[var(--color-secondary)] h-6 w-6" />
                </div>
                <span>Migration Timeline</span>
              </motion.h2>

              <div className="space-y-2">
                {timelineEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="flex sm:gap-6 group"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="p-3 rounded-full bg-white shadow-lg border-2 border-blue-100 group-hover:border-blue-300 transition-all duration-100"
                        whileHover={{ scale: 1.2 }}
                      >
                        {event.icon}
                      </motion.div>
                      {index !== timelineEvents.length - 1 && (
                        <div className="w-0.5 h-12 bg-gradient-to-b from-gray-300 to-transparent my-2"></div>
                      )}
                    </div>

                    <div className="flex-1 sm:pb-6">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 group-hover:bg-white/80 group-hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 text-md">{event.title}</h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">{event.date}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">{event.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Notes Section */}
            <motion.div
              variants={itemVariants}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 overflow-hidden relative"
            >
              <motion.h2
                className="text-lg sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <div className="p-2 rounded-xl bg-purple-100">
                  <MessageSquare className="text-purple-600 h-6 w-6" />
                </div>
                <span>Client Notes</span>
              </motion.h2>

              {/* Add Note Form */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add notes about client communications, document updates, or important milestones..."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] outline-none bg-white/80 backdrop-blur-sm transition-all duration-300 font-medium resize-none"
                  rows="4"
                />
                <div className="flex justify-end mt-2">
                  <motion.button
                    onClick={handleAddNote}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-primary"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Add Note
                  </motion.button>
                </div>
              </motion.div>

              {/* Notes List */}
              <div className="space-y-2">
                <AnimatePresence>
                  {notes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      layout
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-primary"></div>

  <div className="flex flex-col sm:flex-row items-center sm:justify-between sm:items-start mb-1">
                        <div className="flex items-center gap-3">
                          <div className="hidden w-8 h-8 bg-gradient-primary rounded-full sm:flex items-center justify-center text-white font-bold text-sm">
                            {note.author.charAt(0)}
                          </div>
                          <p className="font-bold text-gray-900">{note.author}</p>
                        </div>
                        <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full font-medium">
                          {note.date} • {note.time}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed pl-11">{note.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Quick Actions and Details */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 overflow-hidden relative"
            >
              <motion.h2
                className="text-lg sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
              >
                <div className="p-2 rounded-xl bg-green-100">
                  <CheckCircle className="text-green-600 h-5 w-5" />
                </div>
                <span>Quick Actions</span>
              </motion.h2>

              <div className="space-y-4">
                {[
                  { icon: PhoneCall, label: 'Schedule Consultation', color: 'from-blue-600 to-cyan-600' },
                  { icon: Send, label: 'Send Document Request', color: 'from-green-600 to-emerald-600' },
                  { icon: FileText, label: 'Generate Application', color: 'from-purple-600 to-indigo-600' },
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full group relative overflow-hidden flex items-center gap-4 px-6 py-4 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${action.color}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + index * 0.1 }}
                  >
                    <action.icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Client Details */}
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 overflow-hidden relative"
            >
              <motion.h2
                className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
              >
                <div className="p-2 rounded-xl bg-gray-100">
                  <FileText className="text-gray-600 h-5 w-5" />
                </div>
                <span>Client Details</span>
              </motion.h2>

              <div className="space-y-4">
                {[
                  { label: 'Consultant', value: client.consultant, icon: User },
                  { label: 'Client Since', value: client.created, icon: Calendar },
                  { label: 'Last Activity', value: client.lastActivity, icon: Clock },
                  { label: 'Country', value: client.country, icon: Globe }
                ].map((detail, index) => (
                  <motion.div
                    key={detail.label}
                    className="p-4 bg-gradient-to-r from-white/60 to-gray-50/60 rounded-xl border border-white/30 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.9 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        <detail.icon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-dark font-medium">{detail.label}</p>
                        <p className="text-gray-700 font-bold">{detail.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveClient}
        client={currentClient}
      />
    </div>
  );
};

export default ClientDetailsPage;