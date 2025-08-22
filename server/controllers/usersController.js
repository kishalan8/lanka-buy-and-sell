const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');


// Generate JWT Token with role
const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  .populate("assignedTo", "name email");
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  .populate("assignedTo", "name email");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = req.body.name || user.name;
  if (req.body.password && req.body.password.trim()) {
    user.password = req.body.password;
  }
  user.address = req.body.address || user.address;
  user.country = req.body.country || user.country;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  // Skills
  user.skills = req.body.skills
    ? Array.isArray(req.body.skills)
      ? req.body.skills
      : req.body.skills.split(',').map(s => s.trim())
    : user.skills;

  user.experience = req.body.experience || user.experience;

  // Education (structured)
  user.education = req.body.education
    ? Array.isArray(req.body.education)
      ? req.body.education
      : JSON.parse(req.body.education)
    : user.education;

  // Files
  if (req.files?.picture) user.picture = req.files.picture[0].path;
  if (req.files?.CV) user.CV = req.files.CV[0].path;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    skills: updatedUser.skills,
    experience: updatedUser.experience,
    education: updatedUser.education,
    address: updatedUser.address,
    country: updatedUser.country,
    phoneNumber: updatedUser.phoneNumber,
    picture: updatedUser.picture,
    CV: updatedUser.CV
  });
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// New: Get agent's managed candidates
// @route   GET /api/agent/candidates
// @access  Private/Agent
const getManagedCandidates = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.userType !== 'agent') {
    res.status(403);
    throw new Error('Access denied');
  }
  res.json({ success: true, data: user.managedCandidates });
});

// ------------------------
// POST /api/agent/candidates
// ------------------------
const addManagedCandidate = asyncHandler(async (req, res) => {
  const agent = await User.findById(req.user._id);
  if (!agent || agent.userType !== 'agent') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    let { name, email, phone, skills, experience, address, education, status } = req.body;

    // Ensure skills is an array
    skills = Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()) || [];

    // Parse education array
    if (education) {
      if (typeof education === 'string') education = JSON.parse(education);
      if (!Array.isArray(education)) education = [];
    } else education = [];

    // Prevent duplicate emails
    if (agent.managedCandidates.find(c => c.email === email)) {
      return res.status(400).json({ message: 'Candidate with this email already exists' });
    }

    const candidateData = {
      name,
      email,
      phone,
      skills,
      experience,
      address,
      status: status || 'Pending',
      education: education ? JSON.parse(education) : [],
      addedAt: new Date(),
      documents: []
    };

    // Handle uploaded files
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        const fileArray = req.files[key];
        fileArray.forEach(file => {
          candidateData.documents.push({
            type: key,
            fileName: file.originalname,
            fileUrl: file.path,
            status: 'Pending',
            uploadedAt: new Date()
          });
        });
      });
    }

    agent.managedCandidates.push(candidateData);
    await agent.save();

    res.status(201).json({ success: true, message: 'Candidate added successfully', data: candidateData });
  } catch (error) {
    console.error('Error adding candidate:', error);
    res.status(500).json({ success: false, message: 'Server error while adding candidate' });
  }
});

// ------------------------
// PUT /api/agent/candidates/:candidateId
// ------------------------
const updateManagedCandidate = asyncHandler(async (req, res) => {
  const agent = await User.findById(req.user._id);
  if (!agent || agent.userType !== 'agent') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const candidate = agent.managedCandidates.id(req.params.candidateId);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

  try {
    // Basic fields
    candidate.name = req.body.name || candidate.name;
    candidate.email = req.body.email || candidate.email;
    candidate.phone = req.body.phone || candidate.phone;
    candidate.address = req.body.address || candidate.address;
    candidate.experience = req.body.experience || candidate.experience;
    candidate.status = req.body.status || candidate.status;

    // Update skills
    if (req.body.skills) {
      candidate.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : req.body.skills.split(',').map(s => s.trim());
    }

    // Update education array properly
    if (req.body.education) {
      if (typeof req.body.education === 'string') {
        try {
          candidate.education = JSON.parse(req.body.education);
        } catch (err) {
          return res.status(400).json({ message: 'Invalid education format' });
        }
      } else {
        candidate.education = req.body.education;
      }
    }

    // Update/add documents
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          const existingDoc = candidate.documents.find(doc => doc.type === key);
          if (existingDoc) {
            existingDoc.fileName = file.originalname;
            existingDoc.fileUrl = file.path;
            existingDoc.status = 'Pending';
            existingDoc.uploadedAt = new Date();
          } else {
            candidate.documents.push({
              type: key,
              fileName: file.originalname,
              fileUrl: file.path,
              status: 'Pending',
              uploadedAt: new Date()
            });
          }
        });
      });
    }

    await agent.save();
    res.json({ success: true, message: 'Candidate updated successfully', data: candidate });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ success: false, message: 'Server error while updating candidate' });
  }
});


// DELETE /api/agent/candidates/:candidateId
// Protected, Agent only
const deleteManagedCandidate = asyncHandler(async (req, res) => {
  const agent = await User.findById(req.user._id);

  if (!agent || agent.userType !== 'agent') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const candidate = agent.managedCandidates.id(req.params.candidateId);
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found' });
  }

  try {
    // Remove candidate
    candidate.remove();

    await agent.save();

    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting candidate' });
  }
});


// New: Create inquiry for candidate
// @route   POST /api/agent/inquiries
// @access  Private/Agent
const createInquiry = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.userType !== 'agent') {
    res.status(403);
    throw new Error('Access denied');
  }
  const inquiry = {
    content: req.body.content,
    status: 'Pending'
  };
  user.managedCandidates.id(req.body.candidateId).inquiries.push(inquiry);
  await user.save();
  res.json({ success: true, inquiry });
});

// New: Get agent's inquiries
// @route   GET /api/agent/inquiries
// @access  Private/Agent
const getInquiries = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.userType !== 'agent') {
    res.status(403);
    throw new Error('Access denied');
  }
  const inquiries = user.managedCandidates.flatMap(cand => cand.inquiries.map(inq => ({ ...inq.toObject(), candidateName: cand.name })));
  res.json({ success: true, data: inquiries });
});

// POST /api/agent/candidates/:candidateId/documents
// Protected, Agent only
const uploadDocument = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.userType !== 'agent') {
    res.status(403);
    throw new Error('Access denied');
  }

  const candidate = user.managedCandidates.id(req.params.candidateId);
  if (!candidate) {
    res.status(404);
    throw new Error('Candidate not found');
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const document = {
    type: req.file.fieldname, // 'cv', 'passport', 'picture', 'drivingLicense'
    fileName: req.file.originalname,
    fileUrl: req.file.path,
    status: 'Pending',
    uploadedAt: new Date()
  };

  candidate.documents.push(document);
  await user.save();

  res.status(201).json({ success: true, message: 'Document uploaded', document });
});


// New: Get agent's documents
// @route   GET /api/agent/documents
// @access  Private/Agent
const getDocuments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.userType !== 'agent') {
    res.status(403);
    throw new Error('Access denied');
  }
  const documents = user.managedCandidates.flatMap(cand => cand.documents.map(doc => ({ ...doc.toObject(), candidateName: cand.name })));
  res.json({ success: true, data: documents });
});

// New: Delete document
// @route   DELETE /api/agent/documents/:id
// @access  Private/Agent
const deleteDocument = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.userType !== 'agent') {
    res.status(403);
    throw new Error('Access denied');
  }
  // Find and remove document across all candidates
  user.managedCandidates.forEach(cand => {
    cand.documents = cand.documents.filter(doc => doc._id.toString() !== req.params.id);
  });
  await user.save();
  res.json({ success: true, message: 'Document deleted' });
});

// New: Get agent's applications
// @route   GET /api/agent/applications
// @access  Private/Agent
const getAgentApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ agent: req.user._id }).populate('job', 'title company');
  res.json({ success: true, data: applications });
});

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user profile by admin
const getUsersProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  try {
    // Update basic fields
    user.name = req.body.name || user.name;
    user.address = req.body.address || user.address;
    user.country = req.body.country || user.country;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.gender = req.body.gender || user.gender;
    user.dob = req.body.dob || user.dob;
    user.aboutMe = req.body.aboutMe || user.aboutMe;
    user.jobTitle = req.body.jobTitle || user.jobTitle;
    user.jobCategories = req.body.jobCategories || user.jobCategories;

    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update skills if provided
    if (req.body.skills) {
      user.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : req.body.skills.split(',').map(s => s.trim());
    }

    // Update experience
    if (req.body.experience) {
      user.experience = req.body.experience;
    }

    // Update education (array of objects)
    if (req.body.education) {
      if (typeof req.body.education === 'string') {
        try {
          user.education = JSON.parse(req.body.education);
        } catch (err) {
          return res.status(400).json({ message: 'Invalid education format' });
        }
      } else {
        user.education = req.body.education;
      }
    }

    // Handle file uploads
    if (req.files?.picture) {
      user.picture = req.files.picture[0].path;
    }
    if (req.files?.CV) {
      user.CV = req.files.CV[0].path;
    }

    // Ensure social is always an object
    if (!user.social || Array.isArray(user.social)) {
      user.social = { linkedin: '', github: '', twitter: '', portfolio: '' };
    }
    if (req.body.social) {
      user.social.linkedin = req.body.social.linkedin || user.social.linkedin;
      user.social.github = req.body.social.github || user.social.github;
      user.social.twitter = req.body.social.twitter || user.social.twitter;
      user.social.portfolio = req.body.social.portfolio || user.social.portfolio;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      skills: updatedUser.skills,
      experience: updatedUser.experience,
      education: updatedUser.education,
      picture: updatedUser.picture,
      CV: updatedUser.CV,
      address: updatedUser.address,
      country: updatedUser.country,
      phoneNumber: updatedUser.phoneNumber,
      gender: updatedUser.gender,
      dob: updatedUser.dob,
      aboutMe: updatedUser.aboutMe,
      jobTitle: updatedUser.jobTitle,
      jobCategories: updatedUser.jobCategories,
      social: updatedUser.social,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user (candidate or agent)
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          companyName: user.companyName,
          companyAddress: user.companyAddress,
          contactPerson: user.contactPerson,
          isVerified: user.isVerified,
        },
        token: generateToken(user._id, 'user'),
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// Combined Signup for Candidates and Agents
const signupUser = async (req, res) => {
  try {
    console.log('Signup request body:', req.body);
    console.log('Signup request files:', req.files);

    const { 
      name, 
      email, 
      password, 
      userType,
      // Candidate fields
      address, 
      country, 
      phoneNumber,
      // Agent fields
      companyName,
      companyAddress,
      contactPerson
    } = req.body;

    // Validate required fields
    if (!email || !password || !userType) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, password, and user type are required' 
      });
    }

    // Validate user type
    if (!['candidate', 'agent'].includes(userType)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user type. Must be either candidate or agent' 
      });
    }

    // Type-specific validation
    if (userType === 'candidate' && (!name)) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, first name, and last name are required for candidates' 
      });
    }

    if (userType === 'agent' && (!companyName || !companyAddress || !contactPerson)) {
      return res.status(400).json({ 
        success: false,
        message: 'Company name, address, and contact person are required for agents' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Prepare user data
    const userData = {
      email,
      password,
      userType,
      phoneNumber,
    };

    // Add type-specific fields
    if (userType === 'candidate') {
      userData.name = name;
      userData.address = address;
      userData.country = country;
      
      // Handle file uploads for candidates
      if (req.files?.picture) {
        userData.picture = req.files.picture[0].path;
      }
      if (req.files?.CV) {
        userData.CV = req.files.CV[0].path;
      }
    } else if (userType === 'agent') {
      userData.name = contactPerson; // Use contact person as name for agents
      userData.companyName = companyName;
      userData.companyAddress = companyAddress;
      userData.contactPerson = contactPerson;
      
      // Handle company logo upload for agents
      if (req.files?.companyLogo) {
        userData.companyLogo = req.files.companyLogo[0].path;
      }
    }

    // Create new user
    const user = await User.create(userData);

    // Respond with created user info and token
    if (user) {
      const responseData = {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
        },
        token: generateToken(user._id, 'user'),
      };

      // Add type-specific response data
      if (userType === 'candidate') {
        responseData.user.address = user.address;
        responseData.user.country = user.country;
        responseData.user.phoneNumber = user.phoneNumber;
        responseData.user.picture = user.picture;
        responseData.user.CV = user.CV;
      } else if (userType === 'agent') {
        responseData.user.companyName = user.companyName;
        responseData.user.companyAddress = user.companyAddress;
        responseData.user.contactPerson = user.contactPerson;
        responseData.user.phoneNumber = user.phoneNumber;
        responseData.user.companyLogo = user.companyLogo;
        responseData.user.isVerified = user.isVerified;
      }

      res.status(201).json(responseData);
    } else {
      res.status(400).json({ 
        success: false,
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join('. ') 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

const getUserApplications = async (req, res) => {
  try {
    // Use req.user._id, NOT a string
    const user = await User.findById(req.user._id)
      .populate('appliedJobs.jobId'); // populate the jobs

    if (!user) return res.status(404).json({ message: 'User not found' });

    const applications = user.appliedJobs.map((job) => ({
      id: job._id,
      status: job.status,
      appliedAt: job.appliedAt,
      job: job.jobId, // populated job info
    }));

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch all managed candidates for all agents (for admin)
const getAllManagedCandidates = async (req, res) => {
  try {
    const agents = await User.find({ userType: "agent" }).select("name companyName managedCandidates");

    const allCandidates = [];
    agents.forEach(agent => {
      agent.managedCandidates.forEach(candidate => {
        allCandidates.push({
          ...candidate.toObject(),
          agentName: agent.name,
          agentCompany: agent.companyName,
          agentId: agent._id.toString(),
        });
      });
    });

    res.json({ success: true, data: allCandidates });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching managed candidates", error: error.message });
  }
};

// Update candidate status
const updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { agentId, candidateId } = req.params;

    const agent = await User.findById(agentId);
    if (!agent || agent.userType !== "agent") {
      return res.status(404).json({ message: "Agent not found" });
    }

    const candidate = agent.managedCandidates.id(candidateId);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    candidate.status = status;
    await agent.save();

    res.json({ success: true, message: "Status updated successfully", candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};

const adminUpdateUser = asyncHandler(async (req, res) => {
  const { visaStatus, status, assignedTo, priority } = req.body;
  const userId = req.params.id;

  const validStatus = ["New Application", "Assessment", "Documentation", "Visa Processing", "Offer Received", "Completed", "Rejected"];
  const validPriority = ["High", "Medium", "Low"];
  const validVisaStatus = ['Not Started', 'Processing', 'Approved', 'Rejected', 'Completed'];

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updateData = {};

  // Only candidates can update status and visaStatus
  if (user.userType !== 'agent') {
    if (status) {
      if (!validStatus.includes(status)) {
        res.status(400);
        throw new Error('Invalid status value');
      }
      updateData.status = status;
    }

    if (visaStatus) {
      if (!validVisaStatus.includes(visaStatus)) {
        res.status(400);
        throw new Error('Invalid visa status value');
      }
      updateData.visaStatus = visaStatus;
    }
  }

  // Both agents and candidates can update these
  if (priority) {
    if (!validPriority.includes(priority)) {
      res.status(400);
      throw new Error('Invalid priority value');
    }
    updateData.priority = priority;
  }

  if (assignedTo !== undefined) {
    updateData.assignedTo = assignedTo;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  res.json(updatedUser);
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getManagedCandidates, // New
  addManagedCandidate, // New
  updateManagedCandidate, // New
  deleteManagedCandidate, // New
  createInquiry, // New
  getInquiries, // New
  uploadDocument, // New
  getDocuments, // New
  deleteDocument, // New
  getAgentApplications, // New
  getUserProfile,
  updateUserProfile,
  loginUser,
  signupUser,
  getUserApplications,
  getAllManagedCandidates,
  updateCandidateStatus,
  adminUpdateUser,
  getUsersProfile,
}; 