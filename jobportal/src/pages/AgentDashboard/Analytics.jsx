import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  Download,
  RefreshCw,
  Award,
  Target,
  Clock,
  Star
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import axios from 'axios';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/analytics/dashboard');
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      setRefreshing(true);
      await axios.post('/api/analytics/update');
      await fetchAnalytics();
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await axios.get('/api/analytics/export', {
        params: {
          startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'csv'
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Analytics Data Available</h3>
        <p className="text-gray-500">Analytics data will appear once you start managing candidates and applications.</p>
      </div>
    );
  }

  const { currentMetrics, monthlyTrends, performanceComparison, jobCategoryBreakdown } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your performance and candidate management metrics
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={refreshAnalytics}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            whileHover={{ scale: refreshing ? 1 : 1.05 }}
            whileTap={{ scale: refreshing ? 1 : 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
          
          <motion.button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            Export Data
          </motion.button>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Managed</p>
              <p className="text-3xl font-bold text-gray-800">{currentMetrics?.candidateMetrics?.totalManaged || 0}</p>
              <p className="text-green-600 text-sm">
                +{currentMetrics?.candidateMetrics?.newCandidates || 0} this month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-gray-800">{currentMetrics?.applicationMetrics?.totalApplications || 0}</p>
              <p className="text-blue-600 text-sm">
                {currentMetrics?.applicationMetrics?.pendingApplications || 0} pending
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-gray-800">
                {currentMetrics?.performanceMetrics?.placementSuccessRate?.toFixed(1) || 0}%
              </p>
              <p className="text-purple-600 text-sm">
                {currentMetrics?.candidateMetrics?.successfulPlacements || 0} placements
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Satisfaction Score</p>
              <p className="text-3xl font-bold text-gray-800">
                {currentMetrics?.performanceMetrics?.clientSatisfactionScore || 0}/5
              </p>
              <p className="text-orange-600 text-sm">
                {currentMetrics?.performanceMetrics?.responseRate || 0}% response rate
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {performanceComparison && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performanceComparison.thisMonth?.applications || 0}
                </div>
                <div className="text-gray-600 text-sm">Applications This Month</div>
                <div className={`text-sm ${
                  (performanceComparison.growth?.applications || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {(performanceComparison.growth?.applications || 0) >= 0 ? '+' : ''}
                  {performanceComparison.growth?.applications || 0}% vs last month
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {performanceComparison.thisMonth?.placements || 0}
                </div>
                <div className="text-gray-600 text-sm">Placements This Month</div>
                <div className={`text-sm ${
                  (performanceComparison.growth?.placements || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {(performanceComparison.growth?.placements || 0) >= 0 ? '+' : ''}
                  {performanceComparison.growth?.placements || 0}% vs last month
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceComparison.thisMonth?.candidates || 0}
                </div>
                <div className="text-gray-600 text-sm">New Candidates This Month</div>
                <div className={`text-sm ${
                  (performanceComparison.growth?.candidates || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {(performanceComparison.growth?.candidates || 0) >= 0 ? '+' : ''}
                  {performanceComparison.growth?.candidates || 0}% vs last month
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="placements"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Application Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Application Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Approved', value: currentMetrics?.applicationMetrics?.approvedApplications || 0 },
                    { name: 'Pending', value: currentMetrics?.applicationMetrics?.pendingApplications || 0 },
                    { name: 'Rejected', value: currentMetrics?.applicationMetrics?.rejectedApplications || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Approved', value: currentMetrics?.applicationMetrics?.approvedApplications || 0 },
                    { name: 'Pending', value: currentMetrics?.applicationMetrics?.pendingApplications || 0 },
                    { name: 'Rejected', value: currentMetrics?.applicationMetrics?.rejectedApplications || 0 },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Job Categories Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Job Categories Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jobCategoryBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="applications" fill="#3B82F6" name="Applications" />
              <Bar dataKey="placements" fill="#10B981" name="Placements" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Average Response Time</span>
              <span className="font-semibold">
                {currentMetrics?.performanceMetrics?.averageTimeToPlacement || 0} days
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Top Performing Category</span>
              <span className="font-semibold">
                {jobCategoryBreakdown?.[0]?.category || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Success Rate Trend</span>
              <span className={`font-semibold ${
                (performanceComparison?.growth?.placements || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {(performanceComparison?.growth?.placements || 0) >= 0 ? '↗️ Improving' : '↘️ Declining'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Client Satisfaction</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < (currentMetrics?.performanceMetrics?.clientSatisfactionScore || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Goals and Targets */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Goals & Targets</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Monthly Applications</span>
                <span className="text-sm text-gray-500">
                  {currentMetrics?.applicationMetrics?.totalApplications || 0}/50
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min(((currentMetrics?.applicationMetrics?.totalApplications || 0) / 50) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Success Rate Target</span>
                <span className="text-sm text-gray-500">
                  {currentMetrics?.performanceMetrics?.placementSuccessRate?.toFixed(1) || 0}%/30%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min(((currentMetrics?.performanceMetrics?.placementSuccessRate || 0) / 30) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Candidate Growth</span>
                <span className="text-sm text-gray-500">
                  {currentMetrics?.candidateMetrics?.newCandidates || 0}/20
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min(((currentMetrics?.candidateMetrics?.newCandidates || 0) / 20) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <p className="mb-2">📈 <strong>Tip:</strong> Focus on high-performing categories to improve your success rate.</p>
                <p>🎯 <strong>Goal:</strong> Maintain consistent candidate acquisition for better placement opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Last Updated */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-gray-500 text-sm"
      >
        Last updated: {analyticsData?.lastUpdated 
          ? new Date(analyticsData.lastUpdated).toLocaleString() 
          : 'Never'
        }
      </motion.div>
    </div>
  );
};

export default Analytics;