import { motion } from "framer-motion";
import { hoverCard } from "../dashboardAnimationVariants";
import { Users, FileText, CheckCircle, Phone } from "lucide-react";

const DashboardRecentActivity = ({ activities = defaultActivities }) => (
  <div className="bg-white/80 rounded-xl shadow-xl border border-white/20 p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
      <h2 className="text-description-lg font-semibold text-gray-900">Recent Activities</h2>
      <button className="text-sm text-[var(--color-secondary)] hover:text-[var(--color-primary)] cursor-pointer font-medium">
        View All
      </button>
    </div>
    <div className="space-y-2">
      {activities.map((activity) => (
        <motion.div
          key={activity.id}
          variants={hoverCard}
          whileHover="hover"
          className="flex items-start flex-col sm:flex-row gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="p-2 rounded-lg bg-gray-100 mt-1">
            {activity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-medium text-gray-900 break-words">{activity.title}</h4>
            <p className="text-xs sm:text-sm text-gray-600 break-words">{activity.description}</p>
          </div>
          <div className="text-xs text-muted-dark whitespace-nowrap">{activity.time}</div>
        </motion.div>
      ))}
    </div>
  </div>
);

const defaultActivities = [
  { id: 1, title: "New lead from Canada", description: "John Smith applied for software engineer visa", time: "2 hours ago", icon: <Users size={16} className="text-blue-500" /> },
  { id: 2, title: "Documents submitted", description: "Maria Garcia submitted all required documents", time: "5 hours ago", icon: <FileText size={16} className="text-green-500" /> },
  { id: 3, title: "Visa approved", description: "Ahmed Khan's work visa has been approved", time: "1 day ago", icon: <CheckCircle size={16} className="text-purple-500" /> },
  { id: 4, title: "Client meeting", description: "Scheduled call with Global Talent Agency", time: "2 days ago", icon: <Phone size={16} className="text-amber-500" /> }
];

export default DashboardRecentActivity;
