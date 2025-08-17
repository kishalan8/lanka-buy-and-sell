import { motion } from "framer-motion";

const DashboardMigrationStatus = ({ status = defaultStatus }) => (
  <div className="bg-white/80 rounded-xl shadow-xl border border-white/20 p-6">
    <h2 className="text-description-lg font-semibold text-gray-900 mb-4">Migration Status</h2>
    <div className="space-y-3">
      {status.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ x: 5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
            <span className="text-sm font-medium">{item.country}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">{item.count}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const defaultStatus = [
  { country: "Canada", count: 42, color: "bg-red-500" },
  { country: "Australia", count: 28, color: "bg-blue-500" },
  { country: "UK", count: 19, color: "bg-green-500" },
  { country: "Germany", count: 15, color: "bg-purple-500" },
  { country: "USA", count: 12, color: "bg-amber-500" }
];

export default DashboardMigrationStatus;
