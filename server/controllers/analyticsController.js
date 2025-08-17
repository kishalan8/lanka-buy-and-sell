const AgentAnalytics = require('../models/AgentAnalytics');
const User = require('../models/User');
const Job = require('../models/Job');

// Get agent dashboard analytics
const getAgentDashboardAnalytics = async (req, res) => {
  try {
    const agentId = req.user._id;
    
    // Verify user is an agent
    if (req.user.userType !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Only agents can access analytics'
      });
    }

    // Get current date ranges
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    // Get agent data
    const agent = await User.findById(agentId);
    
    // Calculate current metrics
    const currentMetrics = await calculateCurrentMetrics(agentId, agent);
    
    // Get monthly trends
    const monthlyTrends = await getMonthlyTrends(agentId, 6); // Last 6 months
    
    // Get performance comparison
    const performanceComparison = await getPerformanceComparison(agentId, thisMonth, lastMonth);
    
    // Get job category breakdown
    const jobCategoryBreakdown = await getJobCategoryBreakdown(agentId);

    res.json({
      success: true,
      data: {
        currentMetrics,
        monthlyTrends,
        performanceComparison,
        jobCategoryBreakdown,
        lastUpdated: new Date(),
      }
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data'
    });
  }
};

// Get detailed analytics for a specific period
const getDetailedAnalytics = async (req, res) => {
  try {
    const agentId = req.user._id;
    const { startDate, endDate, period = 'daily' } = req.query;

    // Verify user is an agent
    if (req.user.userType !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Only agents can access analytics'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get analytics data for the period
    const analyticsData = await AgentAnalytics.getAnalyticsRange(agentId, start, end);
    
    // Aggregate data based on period
    const aggregatedData = aggregateAnalyticsData(analyticsData, period);

    res.json({
      success: true,
      data: {
        period,
        startDate: start,
        endDate: end,
        analytics: aggregatedData,
      }
    });

  } catch (error) {
    console.error('Detailed analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching detailed analytics'
    });
  }
};

// Update analytics (called by system or manually)
const updateAnalytics = async (req, res) => {
  try {
    const agentId = req.user._id;
    
    // Verify user is an agent
    if (req.user.userType !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Only agents can update analytics'
      });
    }

    const agent = await User.findById(agentId);
    const metrics = await calculateCurrentMetrics(agentId, agent);
    
    // Update daily analytics
    const updatedAnalytics = await AgentAnalytics.updateDailyAnalytics(agentId, {
      candidateMetrics: metrics.candidateMetrics,
      applicationMetrics: metrics.applicationMetrics,
      performanceMetrics: metrics.performanceMetrics,
    });

    res.json({
      success: true,
      message: 'Analytics updated successfully',
      data: updatedAnalytics,
    });

  } catch (error) {
    console.error('Update analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating analytics'
    });
  }
};

// Helper Functions

const calculateCurrentMetrics = async (agentId, agent) => {
  // Candidate Metrics
  const totalManagedCandidates = agent.managedCandidates.length;
  const newCandidatesThisMonth = agent.managedCandidates.filter(
    candidate => new Date(candidate.addedAt).getMonth() === new Date().getMonth()
  ).length;

  // Get applications from all managed candidates
  const managedCandidateEmails = agent.managedCandidates.map(c => c.email);
  
  // Application Metrics (simplified - you might need to adjust based on your Job model)
  const jobs = await Job.find({});
  let totalApplications = 0;
  let pendingApplications = 0;
  let approvedApplications = 0;
  let rejectedApplications = 0;

  jobs.forEach(job => {
    job.applicants.forEach(applicant => {
      if (managedCandidateEmails.includes(applicant.email)) {
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

  // Performance Metrics
  const placementSuccessRate = totalApplications > 0 
    ? (approvedApplications / totalApplications) * 100 
    : 0;

  return {
    candidateMetrics: {
      totalManaged: totalManagedCandidates,
      newCandidates: newCandidatesThisMonth,
      activeCandidates: totalManagedCandidates, // Simplified
      inactiveCandidates: 0,
      successfulPlacements: approvedApplications,
    },
    applicationMetrics: {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      interviewScheduled: 0, // You can implement this based on your needs
    },
    performanceMetrics: {
      placementSuccessRate: Math.round(placementSuccessRate * 100) / 100,
      averageTimeToPlacement: 0, // Implement based on your tracking
      responseRate: 85, // Mock data - implement based on your system
      clientSatisfactionScore: 4.2, // Mock data
    },
  };
};

const getMonthlyTrends = async (agentId, months) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const analytics = await AgentAnalytics.getAnalyticsRange(agentId, startDate, endDate);
  
  // Group by month
  const monthlyData = {};
  analytics.forEach(record => {
    const monthKey = `${record.date.getFullYear()}-${record.date.getMonth() + 1}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        applications: 0,
        placements: 0,
        candidates: 0,
      };
    }
    monthlyData[monthKey].applications += record.applicationMetrics.totalApplications;
    monthlyData[monthKey].placements += record.candidateMetrics.successfulPlacements;
    monthlyData[monthKey].candidates += record.candidateMetrics.newCandidates;
  });

  return Object.values(monthlyData);
};

const getPerformanceComparison = async (agentId, thisMonth, lastMonth) => {
  const thisMonthData = await AgentAnalytics.find({
    agentId,
    date: { $gte: thisMonth }
  });

  const lastMonthData = await AgentAnalytics.find({
    agentId,
    date: { 
      $gte: lastMonth,
      $lt: thisMonth
    }
  });

  // Calculate totals
  const thisMonthTotals = thisMonthData.reduce((acc, record) => ({
    applications: acc.applications + record.applicationMetrics.totalApplications,
    placements: acc.placements + record.candidateMetrics.successfulPlacements,
    candidates: acc.candidates + record.candidateMetrics.newCandidates,
  }), { applications: 0, placements: 0, candidates: 0 });

  const lastMonthTotals = lastMonthData.reduce((acc, record) => ({
    applications: acc.applications + record.applicationMetrics.totalApplications,
    placements: acc.placements + record.candidateMetrics.successfulPlacements,
    candidates: acc.candidates + record.candidateMetrics.newCandidates,
  }), { applications: 0, placements: 0, candidates: 0 });

  return {
    thisMonth: thisMonthTotals,
    lastMonth: lastMonthTotals,
    growth: {
      applications: calculateGrowthPercentage(lastMonthTotals.applications, thisMonthTotals.applications),
      placements: calculateGrowthPercentage(lastMonthTotals.placements, thisMonthTotals.placements),
      candidates: calculateGrowthPercentage(lastMonthTotals.candidates, thisMonthTotals.candidates),
    }
  };
};

const getJobCategoryBreakdown = async (agentId) => {
  // Mock data - implement based on your job categorization
  return [
    { category: 'IT & Software', applications: 45, placements: 12, successRate: 26.7 },
    { category: 'Healthcare', applications: 32, placements: 8, successRate: 25.0 },
    { category: 'Engineering', applications: 28, placements: 7, successRate: 25.0 },
    { category: 'Sales & Marketing', applications: 23, placements: 5, successRate: 21.7 },
    { category: 'Finance', applications: 18, placements: 4, successRate: 22.2 },
  ];
};

const aggregateAnalyticsData = (data, period) => {
  // Group data by period (daily, weekly, monthly)
  const groupedData = {};
  
  data.forEach(record => {
    let key;
    const date = new Date(record.date);
    
    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!groupedData[key]) {
      groupedData[key] = {
        period: key,
        candidateMetrics: {
          totalManaged: 0,
          newCandidates: 0,
          successfulPlacements: 0
        },
        applicationMetrics: {
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0
        },
        performanceMetrics: {
          placementSuccessRate: 0
        }
      };
    }
    
    // Aggregate the data
    groupedData[key].candidateMetrics.totalManaged += record.candidateMetrics.totalManaged;
    groupedData[key].candidateMetrics.newCandidates += record.candidateMetrics.newCandidates;
    groupedData[key].candidateMetrics.successfulPlacements += record.candidateMetrics.successfulPlacements;
    groupedData[key].applicationMetrics.totalApplications += record.applicationMetrics.totalApplications;
    groupedData[key].applicationMetrics.pendingApplications += record.applicationMetrics.pendingApplications;
    groupedData[key].applicationMetrics.approvedApplications += record.applicationMetrics.approvedApplications;
    groupedData[key].applicationMetrics.rejectedApplications += record.applicationMetrics.rejectedApplications;
  });
  
  // Calculate averages and rates
  Object.values(groupedData).forEach(group => {
    if (group.applicationMetrics.totalApplications > 0) {
      group.performanceMetrics.placementSuccessRate = 
        (group.applicationMetrics.approvedApplications / group.applicationMetrics.totalApplications) * 100;
    }
  });
  
  return Object.values(groupedData);
};

const calculateGrowthPercentage = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100 * 100) / 100;
};

// Export analytics data (for reports)
const exportAnalytics = async (req, res) => {
  try {
    const agentId = req.user._id;
    const { startDate, endDate, format = 'json' } = req.query;
    
    // Verify user is an agent
    if (req.user.userType !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Only agents can export analytics'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const analyticsData = await AgentAnalytics.getAnalyticsRange(agentId, start, end);
    const agent = await User.findById(agentId).select('companyName contactPerson email');
    
    const exportData = {
      agent: {
        company: agent.companyName,
        contact: agent.contactPerson,
        email: agent.email
      },
      period: {
        startDate: start,
        endDate: end
      },
      summary: await calculateCurrentMetrics(agentId, agent),
      detailedData: analyticsData,
      generatedAt: new Date()
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics_${agentId}_${Date.now()}.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting analytics data'
    });
  }
};

const convertToCSV = (data) => {
  // Simple CSV conversion - you can enhance this
  const csvRows = [];
  
  // Headers
  csvRows.push('Date,Total Managed,New Candidates,Applications,Placements,Success Rate');
  
  // Data rows
  data.detailedData.forEach(record => {
    const row = [
      record.date.toISOString().split('T')[0],
      record.candidateMetrics.totalManaged,
      record.candidateMetrics.newCandidates,
      record.applicationMetrics.totalApplications,
      record.candidateMetrics.successfulPlacements,
      record.performanceMetrics.placementSuccessRate
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

module.exports = {
  getAgentDashboardAnalytics,
  getDetailedAnalytics,
  updateAnalytics,
  exportAnalytics,
};