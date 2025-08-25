import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CandidateLayout from './layouts/CandidateLayout';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Jobs from './pages/admin/Jobs';
import Candidates from './pages/admin/Candidates';
import Interviews from './pages/admin/Interviews';
import Evaluation from './pages/admin/Evaluation';
import FinalSelection from './pages/admin/FinalSelection';
import CandidateDetails from './pages/admin/CandidateDetails';
import JobDetails from './pages/admin/JobDetails';

// Candidate Pages
import JobApplication from './pages/candidate/JobApplication';
import CandidatePortal from './pages/candidate/CandidatePortal';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Hiring Management System...</p>
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
