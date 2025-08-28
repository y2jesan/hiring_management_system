import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import qtecLogo from './assets/qtec_icon.svg';
import { ThemeProvider } from './contexts/ThemeContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CandidateLayout from './layouts/CandidateLayout';

// Admin Pages
import CandidateDetails from './pages/admin/CandidateDetails';
import Candidates from './pages/admin/Candidates';
import Dashboard from './pages/admin/Dashboard';
import Evaluation from './pages/admin/Evaluation';
import Experiences from './pages/admin/Experiences';
import FinalSelection from './pages/admin/FinalSelection';
import Interviews from './pages/admin/Interviews';
import JobDetails from './pages/admin/JobDetails';
import Jobs from './pages/admin/Jobs';
import Login from './pages/admin/Login';
import ScheduleInterview from './pages/admin/ScheduleInterview';
import TalentDetails from './pages/admin/TalentDetails';
import Talents from './pages/admin/Talents';
import UserInfo from './pages/admin/UserInfo';
import Users from './pages/admin/Users';

// Candidate Pages
import AllJobs from './pages/candidate/AllJobs';
import CandidatePortal from './pages/candidate/CandidatePortal';
import JobApplication from './pages/candidate/JobApplication';
import TalentPool from './pages/candidate/TalentPool';
import TalentPortal from './pages/candidate/TalentPortal';
import Track from './pages/candidate/Track';

// Context
import { AuthProvider } from './hooks/useAuth.jsx';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary-400"></div>
            <img src={qtecLogo} alt="QTEC Logo" className="absolute h-12 w-12" />
          </div>
          {/* <p className="mt-4 text-gray-600 dark:text-gray-400">Loading QTEC Hiring Management System...</p> */}
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<CandidateLayout />}>
                <Route index element={<Navigate to="/jobs" replace />} />
                <Route path="jobs" element={<AllJobs />} />
                <Route path="job-application/:jobId" element={<JobApplication />} />
                <Route path="application/:applicationId" element={<CandidatePortal />} />
                <Route path="talent-pool" element={<TalentPool />} />
                <Route path="talent/:talent_id" element={<TalentPortal />} />
                <Route path="track" element={<Track />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="jobs/:jobId" element={<JobDetails />} />
                <Route path="candidates" element={<Candidates />} />
                <Route path="candidates/:id" element={<CandidateDetails />} />
                <Route path="scheduleInterview" element={<ScheduleInterview />} />
                <Route path="interviews" element={<Interviews />} />
                <Route path="evaluation" element={<Evaluation />} />
                <Route path="experiences" element={<Experiences />} />
                <Route path="final-selection" element={<FinalSelection />} />
                <Route path="users" element={<Users />} />
                <Route path="user-info" element={<UserInfo />} />
                <Route path="talents" element={<Talents />} />
                <Route path="talents/:id" element={<TalentDetails />} />
              </Route>

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/jobs" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
