import { Link, Outlet } from 'react-router-dom';
import qtecLogo from '../assets/qtec_icon.svg';

const CandidateLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/jobs" className="flex items-center">
                <img src={qtecLogo} alt="QTEC Logo" className="h-8 w-8 mr-3" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/jobs"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                All Jobs
              </Link>
              <Link
                to="/track-application"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Track Application
              </Link>

              <Link
                to="/talent-pool"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Talent Pool
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
};

export default CandidateLayout;
