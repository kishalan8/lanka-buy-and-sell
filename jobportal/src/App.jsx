import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import JobListings from './pages/JobListings';
import JobDetail from './pages/JobDetail';
import EditProfile from './pages/EditProfile';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Candidate Dashboard
import CandidateDashboardLayout from "./pages/CandidateDashboard/DashboardLayout";
import CandidateProfile from "./pages/CandidateDashboard/Profile";
import CandidateApplications from "./pages/CandidateDashboard/Applications";
import CandidateInquiries from "./pages/CandidateDashboard/Inquiries";
import CandidateDocuments from "./pages/CandidateDashboard/Documents";
import SavedJobs from "./pages/CandidateDashboard/SavedJobs";

// Agent Dashboard
import AgentDashboardLayout from "./pages/AgentDashboard/DashboardLayout";
import AgentProfile from "./pages/AgentDashboard/Profile";
import ManagedCandidates from "./pages/AgentDashboard/ManagedCandidates";
import AgentApplications from "./pages/AgentDashboard/Applications";
import AgentInquiries from "./pages/AgentDashboard/Inquiries";
import AgentDocuments from "./pages/AgentDashboard/Documents";
import ChatAgent from "./pages/AgentDashboard/ChatAgent";
import Analytics from "./pages/AgentDashboard/Analytics";

import ScrollToTop from "./components/ScrollToTop";

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/agent');
  const hideNavbarPaths = ['/login', '/signup'];

  return (
    <>
      <ScrollToTop />
      {!hideNavbarPaths.includes(location.pathname) && !isDashboardRoute && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/jobs" replace />} />
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* Protected Candidate Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredUserType="candidate">
              <CandidateDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CandidateProfile />} />
          <Route path="profile" element={<CandidateProfile />} />
          <Route path="applications" element={<CandidateApplications />} />
          <Route path="inquiries" element={<CandidateInquiries />} />
          <Route path="documents" element={<CandidateDocuments />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
        </Route>

        {/* Protected Agent Dashboard Routes */}
        <Route
          path="/agent"
          element={
            <ProtectedRoute requiredUserType="agent">
              <AgentDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AgentProfile />} />
          <Route path="profile" element={<AgentProfile />} />
          <Route path="candidates" element={<ManagedCandidates />} />
          <Route path="applications" element={<AgentApplications />} />
          <Route path="inquiries" element={<AgentInquiries />} />
          <Route path="documents" element={<AgentDocuments />} />
          <Route path="chat" element={<ChatAgent />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/jobs" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;