const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private
const applyForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const existingApplication = await Application.findOne({
    user: req.user._id,
    job: req.params.jobId
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('You have already applied for this job');
  }

  const application = new Application({
    user: req.user._id,
    job: req.params.jobId,
    coverLetter: req.body.coverLetter,
    cv: req.file ? req.file.path : req.user.CV
  });

  const createdApplication = await application.save();

  // Add to user's appliedJobs
  await User.findByIdAndUpdate(req.user._id, {
    $push: { appliedJobs: { jobId: req.params.jobId } }
  });

  res.status(201).json(createdApplication);
});

// @desc    Get user's applications or all (if admin)
// @route   GET /api/applications
// @access  Private or Private/Admin
const getMyApplications = asyncHandler(async (req, res) => {
  // Otherwise, return only user's applications
  const applications = await Application.find({ user: req.user._id }).populate('job', 'title company');
  res.json(applications);
});

// @desc    Get all applications (for admin)
// @route   GET /api/applications/all
// @access  Private/Admin
// Get all applications (for admin)
// controllers/applicationController.js
const getAllApplications = async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate('applicants.userId', 'name email')  // only fetch name and email of applicant
      .sort({ postedAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// @desc    Update application status (for admin)
const updateApplicationStatus = async (req, res) => {
  const { id: jobId } = req.params;
  const { applicantId, status } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applicant = job.applicants.id(applicantId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    applicant.status = status;
    await job.save();

    // Update user's appliedJobs if exists
    const user = await User.findById(applicant.userId);
    if (user) {
      const appliedJob = user.appliedJobs.find(j => j.jobId.toString() === jobId);
      if (appliedJob) {
        appliedJob.status = status;
        await user.save();
      }
    }

    // Optional: emit socket.io event here

    res.json({ message: 'Application status updated', applicant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



 // New: Submit application for managed candidate (agent)
 // @route   POST /api/agent/applications
 // @access  Private/Agent
 const submitAgentApplication = asyncHandler(async (req, res) => {
   const job = await Job.findById(req.body.jobId);
   if (!job) {
     res.status(404);
     throw new Error('Job not found');
   }
   const application = new Application({
     user: req.body.candidateId, // Candidate ID
     job: req.body.jobId,
     agent: req.user._id,
     candidateId: req.body.candidateId,
     status: 'Pending',
     coverLetter: req.body.coverLetter,
     cv: req.file ? req.file.path : null
   });
   const created = await application.save();
   res.status(201).json({ success: true, data: created });
 });

module.exports = {
  applyForJob,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus, // New
  submitAgentApplication // New
};