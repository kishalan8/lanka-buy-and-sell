import { motion } from "framer-motion";
import { containerVariants, itemVariants, hoverButton } from "../dashboardAnimationVariants";
import { Activity } from "lucide-react";
import DashboardQuickActions from "../components/DashboardQuickActions";
import DashboardRecentActivity from "../components/DashboardRecentActivity";
import DashboardDeadlines from "../components/DashboardDeadlines";
import DashboardMigrationStatus from "../components/DashboardMigrationStatus";
import DashboardStats from "../components/DashboardStats";


const DashboardDefault = ({ stats, quickActions, activities, deadlines, migrationStatus }) => (
  <div className="md:p-6">
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-heading-lg font-bold bg-gradient-primary bg-clip-text text-transparent">Dashboard Overview</h1>
          <p className="text-muted-dark text-sm sm:text-base">Welcome back! Track your clients' migration journeys in real-time.</p>
        </div>
        <motion.button variants={hoverButton} whileHover="hover" whileTap="tap" className="flex items-center mx-auto sm:mx-0 gap-2 px-6 py-3 bg-gradient-primary text-white rounded-lg shadow-md cursor-pointer">
          <Activity size={18} />
          <span>Generate Full Report</span>
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <DashboardStats stats={stats} />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <DashboardQuickActions actions={quickActions} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <DashboardRecentActivity activities={activities} />
          </motion.div>
        </div>
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <DashboardDeadlines deadlines={deadlines} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <DashboardMigrationStatus status={migrationStatus} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  </div>
);

export default DashboardDefault;
