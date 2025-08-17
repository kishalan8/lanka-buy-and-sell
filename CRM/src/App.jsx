import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import SalesDashboardLayout from "./pages/SalesDasboardLayout";
import AgentDashboardLayout from "./pages/AgentDashboardLayout";
import AdminManagement from "./pages/AdminManagement";
import LeadsPage from "./pages/LeadsPage";
import ClientsPage from "./pages/ClientsPage";
import ClientPage from "./pages/ClientPage";
import TasksPage from "./pages/TasksPage";
import ReportsPage from "./pages/ReportsPage";
import MyTasksPage from "./pages/MyTasksPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import AddJob from "./pages/AddJob";
import EditJob from "./pages/EditJob";
import ViewJob from "./pages/ViewJob";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<LoginPage />} />

      {/* Admin Dashboard */}
      <Route
        path="/admin-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["MainAdmin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="admin" element={<AdminManagement />} />
        <Route path="admin/settings" element={<ReportsPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="clients" element={<ClientPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="addjob" element={<AddJob />} />
        <Route path="editjob/:id" element={<EditJob />} />
        <Route path="viewjob" element={<ViewJob />} />
      </Route>

      {/* Sales Dashboard */}
      <Route
        path="/sales-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["SalesAdmin"]}>
            <SalesDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="leads" element={<LeadsPage />} />
        <Route path="client" element={<ClientsPage />} />
        <Route path="mytasks" element={<MyTasksPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="addjob" element={<AddJob />} />
        <Route path="editjob/:id" element={<EditJob />} />
        <Route path="viewjob" element={<ViewJob />} />
      </Route>

      {/* Agent Dashboard */}
      <Route
        path="/agent-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["AgentAdmin"]}>
            <AgentDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="mytasks" element={<MyTasksPage />} />
        <Route path="client" element={<ClientsPage />} />
      </Route>

      {/* Unauthorized & 404 */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
