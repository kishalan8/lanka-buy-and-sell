const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/AdminAuth');
const User = require('../models/User');
const Job = require('../models/Job');

// Middleware to ensure only candidates can access wishlist
const candidateOnly = (req, res, next) => {
  if (req.user.userType !== 'candidate') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only candidates can manage wishlist.'
    });
  }
  next();
};

// @desc    Get user's saved jobs
// @route   GET /api/wishlist
// @access  Private (Candidate only)
router.get('/', protect, candidateOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedJobs.jobId'); // only populate the job, no nested populate

    const validSavedJobs = user.savedJobs.filter(savedJob => savedJob.jobId);

    res.json({
      success: true,
      count: validSavedJobs.length,
      data: validSavedJobs.map(savedJob => ({
        savedAt: savedJob.savedAt,
        job: savedJob.jobId
      }))
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs'
    });
  }
});


// @desc    Add job to wishlist
// @route   POST /api/wishlist/:jobId
// @access  Private (Candidate only)
router.post('/:jobId', protect, candidateOnly, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get user and check if job is already saved
    const user = await User.findById(req.user._id);
    const isAlreadySaved = user.savedJobs.some(
      savedJob => savedJob.jobId.toString() === jobId
    );

    if (isAlreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Job is already in your wishlist'
      });
    }

    // Add job to savedJobs
    await user.saveJob(jobId);

    res.json({
      success: true,
      message: 'Job added to wishlist successfully',
      data: {
        jobId,
        jobTitle: job.title,
        savedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding job to wishlist'
    });
  }
});

// @desc    Remove job from wishlist
// @route   DELETE /api/wishlist/:jobId
// @access  Private (Candidate only)
router.delete('/:jobId', protect, candidateOnly, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get user and check if job is in wishlist
    const user = await User.findById(req.user._id);
    const isInWishlist = user.savedJobs.some(
      savedJob => savedJob.jobId.toString() === jobId
    );

    if (!isInWishlist) {
      return res.status(404).json({
        success: false,
        message: 'Job not found in wishlist'
      });
    }

    // Remove job from savedJobs
    await user.unsaveJob(jobId);

    res.json({
      success: true,
      message: 'Job removed from wishlist successfully'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing job from wishlist'
    });
  }
});

// @desc    Check if job is in user's wishlist
// @route   GET /api/wishlist/check/:jobId
// @access  Private (Candidate only)
router.get('/check/:jobId', protect, candidateOnly, async (req, res) => {
  try {
    const { jobId } = req.params;

    const user = await User.findById(req.user._id);
    const isSaved = user.savedJobs.some(
      savedJob => savedJob.jobId.toString() === jobId
    );

    res.json({
      success: true,
      data: {
        jobId,
        isSaved
      }
    });

  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wishlist status'
    });
  }
});

// @desc    Get wishlist summary/stats
// @route   GET /api/wishlist/stats
// @access  Private (Candidate only)
router.get('/stats', protect, candidateOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedJobs.jobId', 'type country postedAt expiringAt');

    const validSavedJobs = user.savedJobs.filter(savedJob => savedJob.jobId);

    // Calculate stats
    const stats = {
      totalSaved: validSavedJobs.length,
      byType: {},
      byCountry: {},
      recentlySaved: validSavedJobs.filter(
        savedJob => new Date() - new Date(savedJob.savedAt) < 7 * 24 * 60 * 60 * 1000
      ).length, // Last 7 days
      expiringThisWeek: 0
    };

    validSavedJobs.forEach(savedJob => {
      const job = savedJob.jobId;
      
      // Count by job type
      stats.byType[job.type] = (stats.byType[job.type] || 0) + 1;
      
      // Count by country
      stats.byCountry[job.country] = (stats.byCountry[job.country] || 0) + 1;
      
      // Count expiring this week
      if (job.expiringAt) {
        const daysUntilExpiry = (new Date(job.expiringAt) - new Date()) / (24 * 60 * 60 * 1000);
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          stats.expiringThisWeek++;
        }
      }
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get wishlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist statistics'
    });
  }
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private (Candidate only)
router.delete('/', protect, candidateOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const previousCount = user.savedJobs.length;
    
    user.savedJobs = [];
    await user.save();

    res.json({
      success: true,
      message: `Cleared ${previousCount} jobs from wishlist`,
      data: {
        removedCount: previousCount
      }
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing wishlist'
    });
  }
});

module.exports = router;