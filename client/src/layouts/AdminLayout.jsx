import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import qtecLogo from '../assets/qtec_icon.svg';
import Loader from '../components/Loader';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false);
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader size="md" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Jobs', href: '/admin/jobs', icon: BriefcaseIcon },
    { name: 'Candidates', href: '/admin/candidates', icon: UsersIcon },
    { name: 'Evaluation', href: '/admin/evaluation', icon: ClipboardDocumentCheckIcon },
    { name: 'Schedule Interview', href: '/admin/scheduleInterview', icon: ClockIcon },
    { name: 'Interviews', href: '/admin/interviews', icon: CalendarIcon },
    { name: 'Final Selection', href: '/admin/final-selection', icon: CheckCircleIcon },
  ];

  const manageSubItems = [
    { name: 'Users', href: '/admin/users', icon: UserCircleIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/admin/dashboard" className="flex items-center">
              <img src={qtecLogo} alt="QTEC Logo" className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Hiring System</h1>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href)
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}

            {/* Manage Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
                className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${manageSubItems.some(item => isActive(item.href))
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
              >
                <UserCircleIcon className="mr-3 h-5 w-5" />
                Manage
                <ChevronDownIcon className={`ml-auto h-4 w-4 transition-transform ${manageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {manageDropdownOpen && (
                <div className="ml-4 space-y-1">
                  {manageSubItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href)
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User controls at bottom of mobile sidebar */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-row justify-between">
              <Link
                to="/admin/user-info"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md"
                onClick={() => setSidebarOpen(false)}
              >
                <UserCircleIcon className="mr-3 h-5 w-5" />
                Profile
              </Link>


              <button
                onClick={logout}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4">
            <Link to="/admin/dashboard" className="flex items-center">
              <img src={qtecLogo} alt="QTEC Logo" className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Hiring System</h1>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href)
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}

            {/* Manage Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
                className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${manageSubItems.some(item => isActive(item.href))
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
              >
                <UserCircleIcon className="mr-3 h-5 w-5" />
                Manage
                <ChevronDownIcon className={`ml-auto h-4 w-4 transition-transform ${manageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {manageDropdownOpen && (
                <div className="ml-4 space-y-1">
                  {manageSubItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href)
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                        }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User controls at bottom of desktop sidebar */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-row justify-between">
              <Link
                to="/admin/user-info"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md"
              >
                <UserCircleIcon className="mr-3 h-5 w-5" />
                Profile
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Centered logo for mobile/tablet */}
          <div className="absolute left-1/2 transform -translate-x-1/2 lg:hidden">
            <Link to="/admin/dashboard" className="flex items-center">
              <img src={qtecLogo} alt="QTEC Logo" className="h-8 w-8 mr-2" />
            </Link>
          </div>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />

            {/* Theme toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            <Link to={'/admin/user-info'} className="hidden lg:flex items-center gap-x-4 lg:gap-x-6 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors duration-200">
              <div className="flex items-center gap-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">{user?.role}</p>
                </div>
              </div>
            </Link>

            {/* Theme toggle for desktop */}
            <button
              onClick={toggleTheme}
              className="hidden lg:flex mt-3 mb-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-12xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
