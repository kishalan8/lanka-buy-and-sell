import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Users, Briefcase, Globe, BarChart2 } from "lucide-react";
import { hoverCard } from "../dashboardAnimationVariants";

const DashboardStats = ({ stats = defaultStats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {stats.map((stat, index) => (
      <motion.div
        key={index}
        variants={hoverCard}
        whileHover="hover"
        className="bg-white/80 rounded-xl shadow-md border border-white/20 p-6"
      >
        <div className="flex justify-between text-center sm:items-start">
          <div>
            <p className="text-sm font-medium text-muted-dark">{stat.title}</p>
            <h3 className="text-lg sm:text-2xl font-bold mt-1">{stat.value}</h3>
            <div className={`flex items-center mt-2 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {stat.isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
              <span className="text-sm font-medium">{stat.change}</span>
            </div>
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
  </div>
);

const defaultStats = [
  { title: "Total Leads", value: "1,248", change: "+12.5%", isPositive: true, icon: <Users className="text-blue-500" size={24} />, color: "bg-blue-100" },
  { title: "Active Deals", value: "84", change: "+3.2%", isPositive: true, icon: <Briefcase className="text-green-500" size={24} />, color: "bg-green-100" },
  { title: "Monthly Revenue", value: "$48,950", change: "+8.7%", isPositive: true, icon: <Globe className="text-purple-500" size={24} />, color: "bg-purple-100" },
  { title: "Conversion Rate", value: "24%", change: "-1.2%", isPositive: false, icon: <BarChart2 className="text-amber-500" size={24} />, color: "bg-amber-100" }
];

export default DashboardStats;
