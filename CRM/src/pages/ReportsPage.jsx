import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { motion } from 'framer-motion';
import { Award, Briefcase, UserCheck, Users } from "lucide-react";

// Mock data to simulate a backend API response.
const mockLeadsOverTime = [
  { name: 'Jan', leads: 4000, placed: 2400 },
  { name: 'Feb', leads: 3000, placed: 1398 },
  { name: 'Mar', leads: 2000, placed: 9800 },
  { name: 'Apr', leads: 2780, placed: 3908 },
  { name: 'May', leads: 1890, placed: 4800 },
  { name: 'Jun', leads: 2390, placed: 3800 },
  { name: 'Jul', leads: 3490, placed: 4300 },
  { name: 'Aug', leads: 4500, placed: 5200 },
];

const mockLeadSources = [
  { name: 'Job Portal', count: 400 },
  { name: 'Referral', count: 300 },
  { name: 'Social Media', count: 200 },
  { name: 'Walk-ins', count: 150 },
  { name: 'Partners', count: 100 },
];

const mockAgentPerformance = [
  { name: 'John Doe', activeCases: 25, successRate: '92%' },
  { name: 'Jane Smith', activeCases: 18, successRate: '85%' },
  { name: 'Sam Wilson', activeCases: 32, successRate: '95%' },
  { name: 'Emily White', activeCases: 21, successRate: '88%' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.6
    }
  },
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
  },
};

const hoverCard = {
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 200,
    }
  }
};

const ReportsPage = () => {
  return (
    <div className="md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-heading-lg font-bold bg-gradient-primary bg-clip-text text-transparent pb-1">Reports</h1>
            <p className="text-muted-dark text-sm sm:text-base">Track and analyze your migration company's performance</p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
         {[
            { 
              label: "Total Candidates", 
              value: "5,432", 
              color: "bg-blue-100", 
              text: "text-blue-500", 
              icon: <Users className="text-blue-500" size={25} /> 
            },
            { 
              label: "Placed Candidates", 
              value: "1,210", 
              color: "bg-green-100", 
              text: "text-green-500", 
              icon: <UserCheck className="text-green-500" size={25} /> 
            },
            { 
              label: "Active Agents", 
              value: "15", 
              color: "bg-purple-100", 
              text: "text-purple-500", 
              icon: <Briefcase className="text-purple-500" size={25} /> 
            },
            { 
              label: "Open Job Posts", 
              value: "245", 
              color: "bg-cyan-100", 
              text: "text-cyan-500", 
              icon: <Award className="text-cyan-500" size={25} /> 
            }].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={hoverCard}
              whileHover="hover"
              className="bg-white/80 rounded-xl shadow-md border border-white/20 p-6"
            >
              <div className="flex justify-center sm:justify-between items-start">
                <div>
                  <p className="text-sm text-center sm:text-left font-medium text-muted-dark">{stat.label}</p>
                  <h3 className={`text-2xl text-center sm:text-left font-bold mt-1 ${stat.text}`}>{stat.value}</h3>
                </div>
                <motion.div
                  className={`hidden sm:block p-3 rounded-lg ${stat.color}`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.4 }}
                >
                 {stat.icon}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Leads Over Time Chart */}
          <motion.div 
            whileHover="hover"
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-description-lg font-semibold text-gray-800 mb-4">Leads and Placements Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockLeadsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#1B3890"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="placed" stroke="#0F79C5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Lead Sources Chart */}
          <motion.div 
            whileHover="hover"
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-description-lg font-semibold text-gray-800 mb-4">Leads by Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockLeadSources}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#1B3890" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

        {/* Agent Performance Table */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-description-lg font-semibold text-gray-800">
                Agent Performance Overview
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Cases
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockAgentPerformance.map((agent, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.activeCases}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.successRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReportsPage;