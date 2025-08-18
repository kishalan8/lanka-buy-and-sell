const express = require('express');
const router = express.Router();
const { protect, authorizeAdmin, protectAdmin } = require('../middlewares/AdminAuth');
const upload = require('../middlewares/upload');
const User = require('../models/User');
const Job = require('../models/Job');
const {getAllManagedCandidates, updateCandidateStatus} = require('../controllers/usersController')

// Middleware to allow only agents
const agentOnly = (req, res, next) => {
  if (req.user.userType !== 'agent') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only agents can access this resource.'
    });
  }
  next();
};

// --------------------
// GET agent profile
// --------------------
router.get('/profile', protect, agentOnly, async (req, res) => {
  try {
    const agent = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: agent });
  } catch (error) {
    console.error('Get agent profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching agent profile' });
  }
});

// Update agent profile
router.put(
  "/update/:id",
  protect, // Make sure req.user is populated first
  upload.single("companyLogo"), // then handle file upload
  async (req, res) => {
    try {
      const { id } = req.params;

      const updateData = { ...req.body };

      // If companyLogo is uploaded, add its path to updateData
      if (req.file) {
        updateData.companyLogo = req.file.path;
      }

      const updatedAgent = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json({ success: true, data: updatedAgent });
    } catch (err) {
      console.error("Error updating agent profile:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// --------------------
// UPDATE agent candidate profile
// --------------------
router.put(
  '/candidates/:candidateId',
  protect,
  agentOnly,
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'picture', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { candidateId } = req.params;
      const updateData = req.body;
      if (updateData.skills && typeof updateData.skills === 'string') {
        updateData.skills = updateData.skills.split(',').map(s => s.trim());
      }

      const agent = await User.findById(req.user._id);
      const candidate = agent.managedCandidates.id(candidateId);
      if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

      // Update basic fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) candidate[key] = updateData[key];
      });

      // Update / add documents
      if (req.files) {
        Object.keys(req.files).forEach(field => {
          const file = req.files[field][0];
          const existingDoc = candidate.documents.find(d => d.type.toLowerCase() === field.toLowerCase());
          if (existingDoc) {
            existingDoc.fileName = file.originalname;
            existingDoc.fileUrl = file.path;
            existingDoc.status = 'Pending';
            existingDoc.uploadedAt = new Date();
          } else {
            candidate.documents.push({
              type: field,
              fileName: file.originalname,
              fileUrl: file.path,
              status: 'Pending',
              uploadedAt: new Date()
            });
          }
        });
      }

      await agent.save();
      res.json({ success: true, message: 'Candidate updated successfully', data: candidate });
    } catch (error) {
      console.error('Update managed candidate error:', error);
      res.status(500).json({ success: false, message: 'Error updating candidate' });
    }
  }
);


// --------------------
// Add managed candidate
// --------------------
router.post(
  '/candidates',
  protect,
  agentOnly,
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'picture', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, email, phone, skills, experience, address, qualifications } = req.body;

      const candidateData = {
        name,
        email,
        phone,
        skills: Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()),
        experience,
        address,
        qualifications: Array.isArray(qualifications) ? qualifications : qualifications?.split(',').map(s => s.trim()),
        addedAt: new Date(),
        documents: [],
      };

      // Push uploaded documents
      if (req.files) {
        if (req.files.cv) candidateData.documents.push({ type: 'CV', fileName: req.files.cv[0].originalname, fileUrl: req.files.cv[0].path });
        if (req.files.passport) candidateData.documents.push({ type: 'Passport', fileName: req.files.passport[0].originalname, fileUrl: req.files.passport[0].path });
        if (req.files.picture) candidateData.documents.push({ type: 'Picture', fileName: req.files.picture[0].originalname, fileUrl: req.files.picture[0].path });
        if (req.files.drivingLicense) candidateData.documents.push({ type: 'DrivingLicense', fileName: req.files.drivingLicense[0].originalname, fileUrl: req.files.drivingLicense[0].path });
      }

      const agent = await User.findById(req.user._id);
      const existingCandidate = agent.managedCandidates.find(c => c.email === email);
      if (existingCandidate) {
        return res.status(400).json({ success: false, message: 'Candidate with this email already exists' });
      }

      agent.managedCandidates.push(candidateData);
      await agent.save();

      res.status(201).json({ success: true, message: 'Candidate added successfully', data: candidateData });
    } catch (error) {
      console.error('Add managed candidate error:', error);
      res.status(500).json({ success: false, message: 'Error adding candidate' });
    }
  }
);


// --------------------
// GET all managed candidates
// --------------------
router.get('/candidates', protect, agentOnly, async (req, res) => {
  try {
    const agent = await User.findById(req.user._id).select('managedCandidates');
    res.json({ success: true, data: agent.managedCandidates || [] });
  } catch (error) {
    console.error('Get managed candidates error:', error);
    res.status(500).json({ success: false, message: 'Error fetching managed candidates' });
  }
});

// --------------------
// UPDATE managed candidate
// --------------------
router.put(
  '/candidates/:candidateId',
  protect,
  agentOnly,
  upload.single('cv'),
  async (req, res) => {
    try {
      const { candidateId } = req.params;
      const updateData = req.body;

      if (updateData.skills && typeof updateData.skills === 'string') {
        updateData.skills = updateData.skills.split(',').map(s => s.trim());
      }

      if (req.file) updateData.cv = req.file.path;

      const agent = await User.findById(req.user._id);
      const candidateIndex = agent.managedCandidates.findIndex(c => c._id.toString() === candidateId);
      if (candidateIndex === -1) return res.status(404).json({ success: false, message: 'Candidate not found' });

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) agent.managedCandidates[candidateIndex][key] = updateData[key];
      });

      await agent.save();
      res.json({ success: true, message: 'Candidate updated successfully', data: agent.managedCandidates[candidateIndex] });
    } catch (error) {
      console.error('Update managed candidate error:', error);
      res.status(500).json({ success: false, message: 'Error updating candidate' });
    }
  }
);

// --------------------
// DELETE managed candidate
// --------------------
router.delete('/candidates/:candidateId', protect, agentOnly, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const agent = await User.findById(req.user._id);
    const candidateIndex = agent.managedCandidates.findIndex(c => c._id.toString() === candidateId);
    if (candidateIndex === -1) return res.status(404).json({ success: false, message: 'Candidate not found' });

    agent.managedCandidates.splice(candidateIndex, 1);
    await agent.save();
    res.json({ success: true, message: 'Candidate removed successfully' });
  } catch (error) {
    console.error('Delete managed candidate error:', error);
    res.status(500).json({ success: false, message: 'Error removing candidate' });
  }
});

// --------------------
// Apply for job on behalf of candidate
// --------------------
router.post('/candidates/:candidateId/apply/:jobId', protect, agentOnly, async (req, res) => {
  try {
    const { candidateId, jobId } = req.params;
    const { applicationNote } = req.body;

    const agent = await User.findById(req.user._id);
    const candidate = agent.managedCandidates.find(c => c._id.toString() === candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const existingApplication = job.applicants.find(a => a.email === candidate.email);
    if (existingApplication) return res.status(400).json({ success: false, message: 'Candidate has already applied for this job' });

    const applicationData = {
      email: candidate.email,
      name: candidate.name,
      phone: candidate.phone,
      cv: candidate.cv,
      appliedBy: 'agent',
      agentId: req.user._id,
      agentCompany: agent.companyName,
      applicationNote,
      status: 'Applied',
      appliedAt: new Date()
    };

    job.applicants.push(applicationData);
    await job.save();

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: { jobTitle: job.title, candidateName: candidate.name, appliedAt: new Date() }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ success: false, message: 'Error submitting application' });
  }
});

// --------------------
// GET applications for agent's managed candidates
// --------------------
router.get('/applications', protect, agentOnly, async (req, res) => {
  try {
    const agent = await User.findById(req.user._id);
    const managedEmails = agent.managedCandidates.map(c => c.email);

    const jobs = await Job.find({});
    const applications = [];

    jobs.forEach(job => {
      job.applicants.forEach(applicant => {
        if (managedEmails.includes(applicant.email)) {
          applications.push({
            _id: applicant._id,
            jobId: job._id,
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            candidateName: applicant.name || applicant.email,
            candidateEmail: applicant.email,
            status: applicant.status,
            appliedAt: applicant.appliedAt,
            salary: job.salary,
            type: job.type
          });
        }
      });
    });

    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Get agent applications error:', error);
    res.status(500).json({ success: false, message: 'Error fetching applications' });
  }
});

// --------------------
// GET agent dashboard stats
// --------------------
router.get('/stats', protect, agentOnly, async (req, res) => {
  try {
    const agent = await User.findById(req.user._id);
    const managedEmails = agent.managedCandidates.map(c => c.email);

    const jobs = await Job.find({});
    let totalApplications = 0, pendingApplications = 0, approvedApplications = 0, rejectedApplications = 0;

    jobs.forEach(job => {
      job.applicants.forEach(applicant => {
        if (managedEmails.includes(applicant.email)) {
          totalApplications++;
          switch (applicant.status) {
            case 'Applied':
            case 'Under Review':
              pendingApplications++;
              break;
            case 'Approved':
            case 'Hired':
              approvedApplications++;
              break;
            case 'Rejected':
              rejectedApplications++;
              break;
          }
        }
      });
    });

    const stats = {
      totalCandidates: agent.managedCandidates.length,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      successRate: totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0,
      thisMonthCandidates: agent.managedCandidates.filter(c => new Date(c.addedAt).getMonth() === new Date().getMonth()).length
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get agent stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching agent statistics' });
  }
});

// Get all managed candidates from all agents
router.get("/candidate", protectAdmin, authorizeAdmin("MainAdmin","AgentAdmin"), getAllManagedCandidates);

// Update candidate status (need agentId and candidateId)
router.put("/candidate/:agentId/:candidateId/status", protectAdmin, authorizeAdmin("MainAdmin","AgentAdmin"), updateCandidateStatus);

module.exports = router;
