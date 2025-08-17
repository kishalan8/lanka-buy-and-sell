const Job = require('../models/Job');

// Get all jobs with their inquiries
const getAllInquiries = async (req, res) => {
  try {
    const jobs = await Job.find({})
      .select('title inquiries') // only get title & inquiries
      .sort({ postedAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update inquiry status for a given job and inquiry
const updateInquiryStatus = async (req, res) => {
  const { jobId, inquiryId } = req.params;
  const { status } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const inquiry = job.inquiries.id(inquiryId);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    inquiry.status = status;
    await job.save();

    res.json({ message: 'Inquiry status updated', inquiry });
  } catch (err) {
    console.error('Error updating inquiry status:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllInquiries,
  updateInquiryStatus
};
