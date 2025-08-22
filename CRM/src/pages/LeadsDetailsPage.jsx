import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, User,
  FileText, MessageSquare, Clock, Download, Building,
  ChevronDown, ChevronUp, Edit, Save, X, Send
} from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";

const mockCandidates = [
  {
    id: 1,
    name: 'John Smith',
    type: 'B2C',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    location: 'Toronto, Canada',
    profession: 'Software Engineer',
    status: 'New Application',
    jobInterest: 'IT Roles',
    lastContact: '2023-05-15',
    resume: 'Submitted',
    visaStatus: 'Approved',
    agent: null,
     dob: '1990-05-15',
    gender: 'Male',
    ageRange: '30-35',
    qualification: 'Master\'s Degree',
    experience: '8 years',
    categories: ['IT & Networking', 'Engineering'],
    languages: ['English', 'French'],
    aboutMe: 'Experienced software engineer with 8 years of expertise in developing scalable web applications. Passionate about clean code architecture and mentoring junior developers. Seeking opportunities to work on challenging projects in a collaborative environment.',
    socialNetworks: [
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/johnsmith' },
      { platform: 'GitHub', url: 'https://github.com/johnsmith' }
    ]
  },
];

const LeadsDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('personal-info');
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        // 👇 call your backend
        const { data } = await axios.get(`/api/leads/${id}`);
        // adjust according to API response
        setCandidate(data?.lead || data); 
      } catch (error) {
        console.error('Error fetching candidate:', error);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-6 text-center">
        <p>No candidate found with ID: {id}</p>
        <button
          onClick={() => navigate('/sales-dashboard/candidates')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Back to Candidates
        </button>
      </div>
    );
  }


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

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New Application': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Assessment': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Documentation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Visa Processing': return 'bg-green-100 text-green-800 border-green-200';
      case 'Offer Received': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisaStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Not Started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Completed': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 py-5 sm:p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Back</span>
        </motion.button>
      </motion.div>

      {/* Candidate Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 overflow-hidden relative"
      >
        {/* Background decoration */}
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
                className={`p-4 rounded-2xl ${candidate.type === 'B2C' ? 'bg-blue-100' : 'bg-indigo-100'} shadow-lg`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                {candidate.type === 'B2C' ? (
                  <User className={`h-10 w-10 ${candidate.type === 'B2C' ? 'text-[var(--color-secondary)]' : 'text-[var(--color-primary)]'}`} />
                ) : (
                  <Briefcase className="h-12 w-12 text-[var(--color-secondary)]" />
                )}
              </motion.div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <motion.h1
                      className="text-heading-lg text-gray-900 mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {candidate.name}
                    </motion.h1>
                    <motion.p
                      className="text-lg text-muted-dark font-medium"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {candidate.profession}
                    </motion.p>
                  </div>

                  <div className="flex justify-center flex-wrap gap-3">
                    <motion.span
                      className={`px-4 py-2 text-sm font-semibold rounded-full border shadow-sm ${getStatusColor(candidate.status)}`}
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {candidate.status}
                    </motion.span>
                    <motion.span
                      className={`px-4 py-2 text-sm font-semibold rounded-full border shadow-sm ${getVisaStatusColor(candidate.visaStatus)}`}
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {candidate.visaStatus}
                    </motion.span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { icon: Mail, label: 'Email', value: candidate.email, color: 'text-blue-500' },
                    { icon: Phone, label: 'Phone', value: candidate.phone, color: 'text-green-500' },
                    { icon: MapPin, label: 'Location', value: candidate.location, color: 'text-red-500' },
                    { icon: FileText, label: 'Last Contact', value: candidate.lastContact, color: 'text-purple-500' }
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

{/* tabs*/}
<motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden relative">
  {/* Background decoration */}
  <div className="absolute top-0 right-0 w-48 h-48 opacity-5 overflow-hidden blur-xl">
    <div
      className="w-full h-full rounded-full"
      style={{
        background: 'linear-gradient(90deg, #1B3890, #0F79C5)'
      }}
    ></div>
  </div>

  <div className="relative z-10">
    {/* Tab Navigation */}
    <div className="flex border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 px-2">
      {['Personal Info', 'Resume/CV', 'Application History'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
          className={`relative px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium transition-all duration-300 group ${activeTab === tab.toLowerCase().replace(' ', '-')
              ? 'text-[var(--color-primary)]'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {tab}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] transition-all duration-300 ${activeTab === tab.toLowerCase().replace(' ', '-') ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
        </button>
      ))}
    </div>

    {/* Tab Content */}
    <div className=" p-4 sm:p-8">
      <AnimatePresence>
        {activeTab === 'personal-info' && (
          <motion.div
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
          >
            {/* Header */}
            <div>
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-500 mt-1">Complete candidate profile details</p>
            </div>
                          {/* About Me Card - Full Width */}
              <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={18} className="text-[var(--color-primary)]" />
                  About Me
                </h4>
                <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-100">
                  <p className="text-gray-700">{candidate.aboutMe || 'No information provided'}</p>
                </div>
              </div>

            {/* Personal Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={18} className="text-[var(--color-primary)]" />
                  Basic Information
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: candidate.name, icon: User },
                    { label: 'Email', value: candidate.email, icon: Mail },
                    { label: 'Phone', value: candidate.phone, icon: Phone },
                    { label: 'Date of Birth', value: candidate.dob, icon: Calendar },
                    { label: 'Gender', value: candidate.gender, icon: User },
                    { label: 'Age Range', value: candidate.ageRange, icon: User },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                      <div className="p-2 bg-gray-100 rounded-lg text-[var(--color-primary)]">
                        <item.icon size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm font-medium text-gray-800">{item.value || 'Not specified'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Information Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-[var(--color-primary)]" />
                  Professional Information
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Location', value: candidate.location, icon: MapPin },
                    { label: 'Profession', value: candidate.profession, icon: Briefcase },
                    { label: 'Qualification', value: candidate.qualification, icon: FileText },
                    { label: 'Experience', value: candidate.experience, icon: Clock },
                    { label: 'Job Interest', value: candidate.jobInterest, icon: Briefcase },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                      <div className="p-2 bg-gray-100 rounded-lg text-[var(--color-primary)]">
                        <item.icon size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm font-medium text-gray-800">{item.value || 'Not specified'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-[var(--color-primary)]" />
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.categories?.map(category => (
                    <span key={category} className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                      {category}
                    </span>
                  ))}
                  {(!candidate.categories || candidate.categories.length === 0) && (
                    <p className="text-gray-500 italic">No categories specified</p>
                  )}
                </div>
              </div>

              {/* Languages Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-[var(--color-primary)]" />
                  Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.languages?.map(language => (
                    <span key={language} className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                      {language}
                    </span>
                  ))}
                  {(!candidate.languages || candidate.languages.length === 0) && (
                    <p className="text-gray-500 italic">No languages specified</p>
                  )}
                </div>
              </div>

              {/* Social Networks Card - Full Width */}
              <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-[var(--color-primary)]" />
                  Social Networks
                </h4>
                <div className="flex flex-wrap gap-3">
                  {candidate.socialNetworks?.map((network, index) => (
                    <a
                      key={index}
                      href={network.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
                    >
                      <span className="font-medium">{network.platform}</span>
                    </a>
                  ))}
                  {(!candidate.socialNetworks || candidate.socialNetworks.length === 0) && (
                    <p className="text-gray-500 italic">No social networks provided</p>
                  )}
                </div>
              </div>
            </div>

            {candidate.agent && (
              <div className="bg-blue-50/80 p-6 rounded-xl border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building size={18} className="text-[var(--color-primary)]" />
                  Agent Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Agency</p>
                    <p className="font-medium">{candidate.agent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="font-medium">{candidate.agent.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{candidate.agent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{candidate.agent.phone}</p>
                  </div>
                </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'resume/cv' && (
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900">Resume & Documents</h3>
                <p className="text-sm text-gray-500 mt-1">Candidate's documents and files</p>
              </div>

              <div className="bg-blue-50/80 p-3 sm:p-6 rounded-xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileText className="h-8 w-8 text-[var(--color-secondary)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold">John_Smith_Resume.pdf</h4>
                    <p className="text-sm text-gray-600">Uploaded on May 15, 2023</p>
                  </div>
                  <button className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg cursor-pointer transition-colors">
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Other Documents</h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Cover_Letter.pdf</p>
                        <p className="text-sm text-gray-500">Uploaded on May 16, 2023</p>
                      </div>
                    </div>
                    <button className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                      <Download size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Certifications.pdf</p>
                        <p className="text-sm text-gray-500">Uploaded on May 18, 2023</p>
                      </div>
                    </div>
                    <button className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="px-4 py-2 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] cursor-pointer rounded-lg hover:bg-blue-100 transition-colors">
                  Upload New Document
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'application-history' && (
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900">Application History</h3>
                <p className="text-sm text-gray-500 mt-1">Candidate's application progress timeline</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Initial Application</p>
                      <p className="text-sm text-gray-500">May 15, 2023</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                      Completed
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">Candidate submitted initial application form</p>
                </div>

                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Skills Assessment</p>
                      <p className="text-sm text-gray-500">May 18, 2023</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full border border-purple-200">
                      Completed
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">Candidate completed technical skills assessment with score of 87%</p>
                </div>

                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Document Verification</p>
                      <p className="text-sm text-gray-500">May 20, 2023</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                      In Progress
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">Waiting for verification of education certificates</p>
                </div>

                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Visa Processing</p>
                      <p className="text-sm text-gray-500">Not started</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full border border-gray-200">
                      Pending
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">Will begin after document verification is complete</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

</motion.div>
    </motion.div>
  );
};

export default LeadsDetailsPage;