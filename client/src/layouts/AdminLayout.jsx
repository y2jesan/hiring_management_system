import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
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
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UserCircleIcon },
    { name: 'Jobs', href: '/admin/jobs', icon: BriefcaseIcon },
    { name: 'Candidates', href: '/admin/candidates', icon: UsersIcon },
    { name: 'Evaluation', href: '/admin/evaluation', icon: ClipboardDocumentCheckIcon },
    { name: 'Interviews', href: '/admin/interviews', icon: CalendarIcon },
    { name: 'Final Selection', href: '/admin/final-selection', icon: CheckCircleIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <img src={qtecLogo} alt="QTEC Logo" className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Hiring System</h1>
            </div>
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
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User controls at bottom of mobile sidebar */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-2">
              <Link
                to="/admin/user-info"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                onClick={() => setSidebarOpen(false)}
              >
                <UserCircleIcon className="mr-3 h-5 w-5" />
                Profile
              </Link>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleTheme}
                  className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? (
                    <SunIcon className="mr-3 h-5 w-5" />
                  ) : (
                    <MoonIcon className="mr-3 h-5 w-5" />
                  )}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              <img src={qtecLogo} alt="QTEC Logo" className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Hiring System</h1>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href)
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User controls at bottom of desktop sidebar */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex flex-row justify-between">
              <Link
                to="/admin/user-info"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <UserCircleIcon className="mr-3 h-5 w-5" />
                Profile
              </Link>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Centered logo for mobile/tablet */}
          <div className="absolute left-1/2 transform -translate-x-1/2 lg:hidden">
            <div className="flex items-center">
              <img src={qtecLogo} alt="QTEC Logo" className="h-8 w-8 mr-2" />
            </div>
          </div>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            
            {/* Theme toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            
            <Link to={'/admin/user-info'} className="hidden lg:flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            </Link>
            
            {/* Theme toggle for desktop */}
            <button
              onClick={toggleTheme}
              className="hidden lg:flex mt-3 p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
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
        <main className="py-6">
          <div className="mx-auto max-w-12xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
