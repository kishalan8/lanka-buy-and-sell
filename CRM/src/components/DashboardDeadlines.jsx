import { motion } from "framer-motion";
import { hoverCard } from "../dashboardAnimationVariants";
import { Calendar } from "lucide-react";

const DashboardDeadlines = ({ deadlines = defaultDeadlines }) => (
  <div className="bg-white/80 rounded-xl shadow-xl border border-white/20 p-6">
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
      <h2 className="text-description-lg text-center sm:text-left font-semibold text-gray-900">Upcoming Deadlines</h2>
      <button className="text-sm text-[var(--color-secondary)] hover:text-[var(--color-primary)] cursor-pointer font-medium">
        View All
      </button>
    </div>
    <div className="space-y-3">
      {deadlines.map((deadline) => (
        <motion.div
          key={deadline.id}
          variants={hoverCard}
          whileHover="hover"
          className="p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{deadline.title}</h3>
              <p className="text-sm text-gray-600">{deadline.client}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              deadline.priority === 'high' ? 'bg-red-100 text-red-800' :
              deadline.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
              'bg-green-100 text-green-800'
            }`}>
              {deadline.priority}
            </span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center text-xs text-muted-dark">
              <Calendar size={13} className="mr-1" />
              <span>{deadline.date}</span>
            </div>
            <div className="text-sm font-medium">{deadline.daysLeft}</div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const defaultDeadlines = [
  { id: 1, title: "Visa submission deadline", client: "John Smith", date: "May 25, 2023", daysLeft: "3 days", priority: "high" },
  { id: 2, title: "Client follow-up", client: "Global Talent Agency", date: "May 28, 2023", daysLeft: "6 days", priority: "medium" },
  { id: 3, title: "Document verification", client: "Maria Garcia", date: "June 1, 2023", daysLeft: "10 days", priority: "low" }
];

export default DashboardDeadlines;
