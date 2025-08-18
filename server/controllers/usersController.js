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
  const users = await User.find({});
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
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
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

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

// POST /api/agent/candidates
// Protected, Agent only
const addManagedCandidate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.userType !== 'agent') {
    res.status(403);
    throw new Error('Access denied');
  }

  const { name, email, phone, skills, experience, address, qualifications } = req.body;

  const candidateData = {
    name,
    email,
    phone,
    skills: Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()),
    experience,
    address,
    qualifications: Array.isArray(qualifications) ? qualifications : qualifications?.split(',').map(q => q.trim()),
    addedAt: new Date(),
    documents: [] // Initialize empty documents array
  };

  // Handle multiple uploaded files with types
  // req.files should be an array of files with 'fieldname' as type
  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      candidateData.documents.push({
        type: file.fieldname, // e.g., 'cv', 'passport', 'picture', 'drivingLicense'
        fileName: file.originalname,
        fileUrl: file.path,
        status: 'Pending'
      });
    });
  }

  // Check for existing candidate by email
  const existingCandidate = user.managedCandidates.find(c => c.email === email);
  if (existingCandidate) {
    return res.status(400).json({ success: false, message: 'Candidate with this email already exists' });
  }

  user.managedCandidates.push(candidateData);
  await user.save();

  res.status(201).json({ success: true, message: 'Candidate added successfully', data: candidateData });
});


// PUT /api/agent/candidates/:candidateId
// Protected, Agent only
const updateManagedCandidate = asyncHandler(async (req, res) => {
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

  // Update basic info
  candidate.name = req.body.name || candidate.name;
  candidate.email = req.body.email || candidate.email;
  candidate.phone = req.body.phone || candidate.phone;
  candidate.skills = req.body.skills 
    ? Array.isArray(req.body.skills) 
      ? req.body.skills 
      : req.body.skills.split(',').map(s => s.trim())
    : candidate.skills;
  candidate.experience = req.body.experience || candidate.experience;
  candidate.address = req.body.address || candidate.address;
  candidate.qualifications = req.body.qualifications
    ? Array.isArray(req.body.qualifications)
      ? req.body.qualifications
      : req.body.qualifications.split(',').map(q => q.trim())
    : candidate.qualifications;

  // Update / add documents
  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      // Check if document of this type exists; if so, replace, else add
      const existingDoc = candidate.documents.find(doc => doc.type === file.fieldname);
      if (existingDoc) {
        existingDoc.fileName = file.originalname;
        existingDoc.fileUrl = file.path;
        existingDoc.status = 'Pending';
        existingDoc.uploadedAt = new Date();
      } else {
        candidate.documents.push({
          type: file.fieldname,
          fileName: file.originalname,
          fileUrl: file.path,
          status: 'Pending',
          uploadedAt: new Date()
        });
      }
    });
  }

  await user.save();

  res.json({ success: true, message: 'Candidate updated successfully', data: candidate });
});


// New: Delete managed candidate
// @route   DELETE /api/agent/candidates/:id
// @access  Private/Agent
const deleteManagedCandidate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.userType !== 'agent') {
    res.status(403);
    throw new Error('Access denied');
  }
  user.managedCandidates.id(req.params.id).remove();
  await user.save();
  res.json({ success: true, message: 'Candidate deleted' });
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

// Update user profile
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update name instead of fullName
    user.name = req.body.name || user.name;

    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update other fields
    user.address = req.body.address || user.address;
    user.country = req.body.country || user.country;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    // Files
    if (req.files?.picture) {
      user.picture = req.files.picture[0].path; // assuming Cloudinary or similar
    }
    if (req.files?.CV) {
      user.CV = req.files.CV[0].path;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      picture: updatedUser.picture,
      CV: updatedUser.CV,
      address: updatedUser.address,
      country: updatedUser.country,
      phoneNumber: updatedUser.phoneNumber,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
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
  updateCandidateStatus
}; 