import {
    ArrowTopRightOnSquareIcon,
    BriefcaseIcon,
    CalendarIcon,
    ClockIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import { dashboardService } from '../../services/dashboardService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [statsData, activitiesData] = await Promise.all([
                    dashboardService.getDashboardStats(),
                    dashboardService.getRecentActivities()
                ]);

                // Extract stats from the nested structure
                const statsFromResponse = statsData.data?.stats || statsData.data || {};
                setStats(statsFromResponse);

                // Extract activities from the nested structure
                const activitiesFromResponse = activitiesData.data?.activities || {};
                setRecentActivities(activitiesFromResponse);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                // Set default values on error
                setStats({});
                setRecentActivities({});
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        {
            name: 'Total Applications',
            value: stats?.overview?.totalCandidates || 0,
            icon: UsersIcon,
            color: 'bg-blue-500'
        },
        {
            name: 'Active Jobs',
            value: stats?.overview?.activeJobs || 0,
            icon: BriefcaseIcon,
            color: 'bg-green-500'
        },
        {
            name: 'Total Jobs',
            value: stats?.overview?.totalJobs || 0,
            icon: BriefcaseIcon,
            color: 'bg-indigo-500'
        },
        {
            name: 'Total Interviews',
            value: stats?.overview?.totalInterviews || 0,
            icon: CalendarIcon,
            color: 'bg-purple-500'
        },
        {
            name: 'Recent Applications (7 days)',
            value: stats?.overview?.recentApplications || 0,
            icon: ClockIcon,
            color: 'bg-yellow-500'
        },
        {
            name: 'Upcoming Interviews',
            value: stats?.overview?.upcomingInterviews || 0,
            icon: CalendarIcon,
            color: 'bg-orange-500'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied':
                return 'bg-blue-100 text-blue-800';
            case 'Task Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Task Submitted':
                return 'bg-purple-100 text-purple-800';
            case 'Under Review':
                return 'bg-orange-100 text-orange-800';
            case 'Interview Eligible':
                return 'bg-green-100 text-green-800';
            case 'Interview Scheduled':
                return 'bg-indigo-100 text-indigo-800';
            case 'Interview Completed':
                return 'bg-gray-100 text-gray-800';
            case 'Shortlisted':
                return 'bg-pink-100 text-pink-800';
            case 'Selected':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusCardClick = (status) => {
        navigate(`/admin/candidates?status=${encodeURIComponent(status)}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="md" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary-800">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500 hidden lg:block">
                    Overview of your hiring management system
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <stat.icon className={`h-6 w-6 text-white ${stat.color} p-1 rounded-md`} />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {stat.name}
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">
                                                {stat.value}
                                            </div>
                                            {/* <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {stat.change}
                                            </div> */}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Link to={'/admin/jobs?create=true'} className="relative group text-center bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-400 rounded-lg border border-gray-200 hover:border-primary-200">
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white">
                                    <BriefcaseIcon className="h-6 w-6" />
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Create New Job
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Post a new job opening
                                </p>
                            </div>
                        </Link>

                        <Link to={'/admin/candidates'} className="relative group text-center bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                                    <UsersIcon className="h-6 w-6" />
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    View Candidates
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Manage candidate applications
                                </p>
                            </div>
                        </Link>

                        <Link to={'/admin/interviews'} className="relative group text-center bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                                    <CalendarIcon className="h-6 w-6" />
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Schedule Interview
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Book interview slots
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Candidate Status Distribution */}
            {stats?.candidateStatus && Object.keys(stats.candidateStatus).length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Candidate Status Distribution
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(stats.candidateStatus).map(([status, count]) => (
                                        <div
            key={status}
            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-primary-50 hover:shadow-md transition-all duration-200 group border border-transparent hover:border-primary-200"
            onClick={() => handleStatusCardClick(status)}
            title={`View all ${status} candidates`}
        >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{status}</p>
                                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status).replace('bg-', 'bg-').replace('text-', '')}`}></div>
                                            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Recent Activities
                    </h3>
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {recentActivities.recentCandidates && recentActivities.recentCandidates.length > 0 ? (
                                recentActivities.recentCandidates.map((candidate, idx) => (
                                    <li key={candidate._id}>
                                        <div className="relative pb-8">
                                            {idx !== recentActivities.recentCandidates.length - 1 ? (
                                                <span
                                                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-blue-500">
                                                        <UsersIcon className="h-5 w-5 text-white" />
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            <Link to={`/admin/candidates/${candidate._id}`} className="font-medium text-gray-900 hover:underline">{candidate.name}</Link> applied for{' '}
                                                            <Link to={`/admin/jobs/${candidate.job_id?.job_id}`} className="font-medium text-gray-900 hover:underline">{candidate.job_id?.title || 'Unknown Job'}</Link>
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Status: {candidate.status}
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                        <time dateTime={candidate.createdAt}>
                                                            {new Date(candidate.createdAt).toLocaleDateString()}
                                                        </time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-center py-8 text-gray-500">
                                    No recent applications
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            

            {/* Interview Results */}
            {stats?.interviewResults && Object.keys(stats.interviewResults).length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Interview Results
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(stats.interviewResults).map(([result, count]) => (
                                <div key={result} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{result}</p>
                                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${
                                            result === 'Passed' ? 'bg-green-500' :
                                            result === 'Failed' ? 'bg-red-500' :
                                            result === 'No Show' ? 'bg-yellow-500' :
                                            'bg-gray-500'
                                        }`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {stats.passRate !== undefined && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-900">
                                    Interview Pass Rate: <span className="text-2xl font-bold">{stats.passRate}%</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )} 
        </div>
    );
};

export default Dashboard;
