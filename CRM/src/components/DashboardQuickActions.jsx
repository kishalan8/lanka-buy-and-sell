import { motion } from "framer-motion";
import { hoverButton } from "../dashboardAnimationVariants";
import { Plus, CheckCircle, FileText, Calendar } from "lucide-react";

const DashboardQuickActions = ({ actions = defaultActions }) => (
  <div className="bg-white/80 rounded-xl shadow-lg border border-white/20 p-6">
    <h2 className="text-description-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          variants={hoverButton}
          whileHover="hover"
          whileTap="tap"
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all cursor-pointer ${action.color}`}
        >
          <motion.div 
            className="p-2 rounded-full bg-white mb-2"
            whileHover={{ rotate: 15 }}
          >
            {action.icon}
          </motion.div>
          <span className="text-sm font-medium text-center">{action.title}</span>
        </motion.button>
      ))}
    </div>
  </div>
);

const defaultActions = [
  { title: "Create New Lead", icon: <Plus size={20} className="text-blue-500" />, color: "bg-blue-100 hover:bg-blue-200" },
  { title: "Add New Task", icon: <CheckCircle size={20} className="text-green-500" />, color: "bg-green-100 hover:bg-green-200" },
  { title: "Generate Report", icon: <FileText size={20} className="text-purple-500" />, color: "bg-purple-100 hover:bg-purple-200" },
  { title: "Schedule Meeting", icon: <Calendar size={20} className="text-amber-500" />, color: "bg-amber-100 hover:bg-amber-200" }
];

export default DashboardQuickActions;
