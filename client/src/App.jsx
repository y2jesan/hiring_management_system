import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import qtecLogo from './assets/qtec_icon.svg';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import CandidateDetails from './pages/admin/CandidateDetails';
import Candidates from './pages/admin/Candidates';
import Dashboard from './pages/admin/Dashboard';
import Evaluation from './pages/admin/Evaluation';
import FinalSelection from './pages/admin/FinalSelection';
import Interviews from './pages/admin/Interviews';
import JobDetails from './pages/admin/JobDetails';
import Jobs from './pages/admin/Jobs';
import Login from './pages/admin/Login';
import Users from './pages/admin/Users';

// Candidate Pages
import CandidatePortal from './pages/candidate/CandidatePortal';
import JobApplication from './pages/candidate/JobApplication';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={qtecLogo} alt="QTEC Logo" className="h-12 w-12 mr-3" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading QTEC Hiring Management System...</p>
        </div>
      </div>
    );
  }

  return (
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
            <Route path="/job-application/:jobId" element={<JobApplication />} />
            <Route path="/application/:applicationId" element={<CandidatePortal />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/:jobId" element={<JobDetails />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="candidates/:id" element={<CandidateDetails />} />
              <Route path="interviews" element={<Interviews />} />
              <Route path="evaluation" element={<Evaluation />} />
              <Route path="final-selection" element={<FinalSelection />} />
              <Route path="users" element={<Users />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
