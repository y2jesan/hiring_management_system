import {
    BriefcaseIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    UsersIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';

const Dashboard = () => {
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

                setStats(statsData.data);
                setRecentActivities(activitiesData.data || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        {
            name: 'Total Applications',
            value: stats?.totalApplications || 0,
            icon: UsersIcon,
            color: 'bg-blue-500',
            change: '+12%',
            changeType: 'positive'
        },
        {
            name: 'Active Jobs',
            value: stats?.activeJobs || 0,
            icon: BriefcaseIcon,
            color: 'bg-green-500',
            change: '+5%',
            changeType: 'positive'
        },
        {
            name: 'Pending Evaluations',
            value: stats?.pendingEvaluations || 0,
            icon: ClockIcon,
            color: 'bg-yellow-500',
            change: '+8%',
            changeType: 'negative'
        },
        {
            name: 'Interviews Scheduled',
            value: stats?.interviewsScheduled || 0,
            icon: CalendarIcon,
            color: 'bg-purple-500',
            change: '+15%',
            changeType: 'positive'
        },
        {
            name: 'Selected Candidates',
            value: stats?.selectedCandidates || 0,
            icon: CheckCircleIcon,
            color: 'bg-green-600',
            change: '+3%',
            changeType: 'positive'
        },
        {
            name: 'Rejected Candidates',
            value: stats?.rejectedCandidates || 0,
            icon: XCircleIcon,
            color: 'bg-red-500',
            change: '+2%',
            changeType: 'negative'
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
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
                                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {stat.change}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activities */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Recent Activities
                    </h3>
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, activityIdx) => (
                                    <li key={activity.id}>
                                        <div className="relative pb-8">
                                            {activityIdx !== recentActivities.length - 1 ? (
                                                <span
                                                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.type === 'application' ? 'bg-blue-500' :
                                                            activity.type === 'evaluation' ? 'bg-green-500' :
                                                                activity.type === 'interview' ? 'bg-purple-500' :
                                                                    'bg-gray-500'
                                                        }`}>
                                                        <UsersIcon className="h-5 w-5 text-white" />
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            {activity.description}
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                        <time dateTime={activity.created_at}>
                                                            {new Date(activity.created_at).toLocaleDateString()}
                                                        </time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-center py-8 text-gray-500">
                                    No recent activities
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
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
                        </button>

                        <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
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
                        </button>

                        <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
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
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
