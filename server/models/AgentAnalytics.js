const mongoose = require('mongoose');

const agentAnalyticsSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Date for the analytics record
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  
  // Candidate Management Metrics
  candidateMetrics: {
    totalManaged: {
      type: Number,
      default: 0,
    },
    newCandidates: {
      type: Number,
      default: 0,
    },
    activeCandidates: {
      type: Number,
      default: 0,
    },
    inactiveCandidates: {
      type: Number,
      default: 0,
    },
    successfulPlacements: {
      type: Number,
      default: 0,
    },
  },

  // Application Metrics
  applicationMetrics: {
    totalApplications: {
      type: Number,
      default: 0,
    },
    pendingApplications: {
      type: Number,
      default: 0,
    },
    approvedApplications: {
      type: Number,
      default: 0,
    },
    rejectedApplications: {
      type: Number,
      default: 0,
    },
    interviewScheduled: {
      type: Number,
      default: 0,
    },
  },

  // Performance Metrics
  performanceMetrics: {
    placementSuccessRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageTimeToPlacement: {
      type: Number, // in days
      default: 0,
    },
    responseRate: {
      type: Number, // percentage
      default: 0,
      min: 0,
      max: 100,
    },
    clientSatisfactionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },

  // Job Category Performance
  jobCategories: [{
    category: {
      type: String,
      required: true,
    },
    applications: {
      type: Number,
      default: 0,
    },
    placements: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  }],

  // Monthly Revenue/Commission (optional for agents)
  revenue: {
    totalEarnings: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    bonuses: {
      type: Number,
      default: 0,
    },
  },

  // Activity Metrics
  activityMetrics: {
    profileViews: {
      type: Number,
      default: 0,
    },
    messagesReceived: {
      type: Number,
      default: 0,
    },
    messagesSent: {
      type: Number,
      default: 0,
    },
    documentsUploaded: {
      type: Number,
      default: 0,
    },
  },

}, { 
  timestamps: true,
  // Create compound index for efficient queries
  indexes: [
    { agentId: 1, date: -1 },
    { date: -1 },
  ]
});

// Static method to create or update daily analytics
agentAnalyticsSchema.statics.updateDailyAnalytics = async function(agentId, metrics) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await this.findOneAndUpdate(
    { 
      agentId: agentId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    { 
      $set: metrics,
      $setOnInsert: { agentId, date: today }
    },
    { 
      upsert: true, 
      new: true,
      runValidators: true
    }
  );
};

// Static method to get analytics for a date range
agentAnalyticsSchema.statics.getAnalyticsRange = async function(agentId, startDate, endDate) {
  return await this.find({
    agentId: agentId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Instance method to calculate success rates
agentAnalyticsSchema.methods.calculateSuccessRates = function() {
  // Calculate placement success rate
  if (this.candidateMetrics.totalManaged > 0) {
    this.performanceMetrics.placementSuccessRate = 
      (this.candidateMetrics.successfulPlacements / this.candidateMetrics.totalManaged) * 100;
  }

  // Calculate application approval rate
  if (this.applicationMetrics.totalApplications > 0) {
    const approvalRate = 
      (this.applicationMetrics.approvedApplications / this.applicationMetrics.totalApplications) * 100;
    // Store in performance metrics if needed
  }

  // Calculate job category success rates
  this.jobCategories.forEach(category => {
    if (category.applications > 0) {
      category.successRate = (category.placements / category.applications) * 100;
    }
  });

  return this;
};

// Pre-save middleware to calculate rates
agentAnalyticsSchema.pre('save', function(next) {
  this.calculateSuccessRates();
  next();
});

module.exports = mongoose.model('AgentAnalytics', agentAnalyticsSchema);