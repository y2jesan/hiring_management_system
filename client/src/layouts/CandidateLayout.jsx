import { BookOpenIcon, BriefcaseIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link, Outlet, useLocation } from 'react-router-dom';
import qtecLogo from '../assets/qtec_icon.svg';

const CandidateLayout = () => {
  const location = useLocation();

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
            <div className="flex items-center">
              <Link
                to="/jobs"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/jobs'
                  ? 'text-primary-800'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <BriefcaseIcon className="h-5 w-5" />
                <span className="hidden ml-2 sm:inline">All Jobs</span>
              </Link>

              <Link
                to="/talent-pool"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/talent-pool'
                  ? 'text-primary-800'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <BookOpenIcon className="h-5 w-5" />
                <span className="hidden ml-2 sm:inline">Talent Pool</span>
              </Link>
              <Link
                to="/track"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/track'
                  ? 'text-primary-800'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span className="hidden ml-2 sm:inline">Track</span>
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
