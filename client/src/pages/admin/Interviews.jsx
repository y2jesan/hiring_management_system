import {
    ArrowPathIcon,
    CalendarIcon,
    CheckIcon,
    ClockIcon,
    EyeIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { interviewService } from '../../services/interviewService';
import { jobService } from '../../services/jobService';
import { userService } from '../../services/userService';

const Interviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [evaluators, setEvaluators] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states for active interviews
    const [activeSearchTerm, setActiveSearchTerm] = useState('');
    const [activeStatusFilter, setActiveStatusFilter] = useState('');
    const [activeJobFilter, setActiveJobFilter] = useState('');
    const [activeDateFilter, setActiveDateFilter] = useState('');
    const [activeLocationFilter, setActiveLocationFilter] = useState('');
    const [showActiveFilters, setShowActiveFilters] = useState(false);

    // Filter states for all interviews table
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [tableStatusFilter, setTableStatusFilter] = useState('');
    const [tableJobFilter, setTableJobFilter] = useState('');
    const [tableDateFilter, setTableDateFilter] = useState('');
    const [tableLocationFilter, setTableLocationFilter] = useState('');
    const [showTableFilters, setShowTableFilters] = useState(false);

    // Complete Interview Modal states
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showNextInterviewModal, setShowNextInterviewModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [completeFormData, setCompleteFormData] = useState({
        candidateStatus: 'Interview Completed',
        interviewResult: 'Taken',
        interviewStatus: 'Completed',
        feedback: '',
        notes: ''
    });
    const [nextInterviewData, setNextInterviewData] = useState({
        candidate_id: '',
        job_id: '',
        scheduled_date: '',
        scheduled_time: '',
        interviewer: '',
        location: 'In-Person',
        meeting_link: '',
        notes: ''
    });
    const [rescheduleData, setRescheduleData] = useState({
        scheduled_date: '',
        scheduled_time: '',
        notes: ''
    });
    const [cancelData, setCancelData] = useState({
        feedback: '',
        notes: '',
        candidateStatus: 'Interview Eligible'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [interviewsData, jobsData, evaluatorsData, mdUsersData] = await Promise.all([
                interviewService.getAllInterviews(),
                jobService.getAllJobs({ is_active: true }),
                userService.getAllUsers({ role: 'Evaluator', is_active: true }),
                userService.getAllUsers({ role: 'MD', is_active: true })
            ]);

            // Handle different response structures
            const interviewsArray = interviewsData.data?.interviews || interviewsData.interviews || [];
            const jobsArray = jobsData.data?.jobs || jobsData.jobs || [];
            const evaluatorsArray = evaluatorsData.data?.users || evaluatorsData.users || [];
            const mdUsersArray = mdUsersData.data?.users || mdUsersData.users || [];

            // Combine evaluators and MD users
            const allEvaluators = [
                ...(Array.isArray(evaluatorsArray) ? evaluatorsArray : []),
                ...(Array.isArray(mdUsersArray) ? mdUsersArray : [])
            ];

            setInterviews(Array.isArray(interviewsArray) ? interviewsArray : []);
            setJobs(Array.isArray(jobsArray) ? jobsArray : []);
            setEvaluators(allEvaluators);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
            setInterviews([]);
            setJobs([]);
            setEvaluators([]);
        } finally {
            setLoading(false);
        }
    };



    const handleCompleteInterview = (interview) => {
        setSelectedInterview(interview);
        setCompleteFormData({
            candidateStatus: 'Interview Completed',
            interviewResult: 'Taken', // Always default to 'Taken' for new completions
            interviewStatus: 'Completed',
            feedback: interview.feedback || '',
            notes: interview.notes || ''
        });
        setShowCompleteModal(true);
    };

    const handleSubmitCompleteInterview = async (e) => {
        e.preventDefault();

        if (!selectedInterview) {
            toast.error('No interview selected');
            return;
        }

        try {
            setSubmitting(true);

            const completeData = {
                candidateStatus: completeFormData.candidateStatus,
                interviewResult: completeFormData.interviewResult,
                interviewStatus: completeFormData.interviewStatus,
                feedback: completeFormData.feedback,
                notes: completeFormData.notes
            };

            await interviewService.completeInterview(selectedInterview._id, selectedInterview.candidate_id._id, completeData);
            toast.success('Interview completed successfully');
            setShowCompleteModal(false);
            setSelectedInterview(null);
            setCompleteFormData({
                candidateStatus: 'Interview Completed',
                interviewResult: 'Taken',
                interviewStatus: 'Completed',
                feedback: '',
                notes: ''
            });
            fetchData();
        } catch (error) {
            console.error('Error completing interview:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to complete interview');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleScheduleNextInterview = (interview) => {
        setSelectedInterview(interview);
        setNextInterviewData({
            candidate_id: interview.candidate_id._id,
            job_id: interview.job_id._id,
            scheduled_date: '',
            scheduled_time: '',
            interviewer: '',
            location: 'In-Person',
            meeting_link: '',
            feedback: '',
            notes: ''
        });
        setShowNextInterviewModal(true);
    };

    const handleSubmitNextInterview = async (e) => {
        e.preventDefault();

        if (!selectedInterview) {
            toast.error('No interview selected');
            return;
        }

        try {
            setSubmitting(true);

            // Combine date and time into a single datetime string
            const scheduledDateTime = `${nextInterviewData.scheduled_date}T${nextInterviewData.scheduled_time}`;

            const nextInterviewPayload = {
                ...nextInterviewData,
                scheduled_date: scheduledDateTime
            };

            await interviewService.scheduleNextInterview(nextInterviewPayload);
            toast.success('Next interview scheduled successfully');
            setShowNextInterviewModal(false);
            setSelectedInterview(null);
            setNextInterviewData({
                candidate_id: '',
                job_id: '',
                scheduled_date: '',
                scheduled_time: '',
                interviewer: '',
                location: 'In-Person',
                meeting_link: '',
                notes: ''
            });
            fetchData();
        } catch (error) {
            console.error('Error scheduling next interview:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to schedule next interview');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleRescheduleInterview = (interview) => {
        setSelectedInterview(interview);
        const interviewDate = interview.scheduled_date ? new Date(interview.scheduled_date) : new Date();
        setRescheduleData({
            scheduled_date: interviewDate.toISOString().split('T')[0],
            scheduled_time: interviewDate.toTimeString().split(' ')[0].substring(0, 5),
            notes: ''
        });
        setShowRescheduleModal(true);
    };

    const handleSubmitReschedule = async (e) => {
        e.preventDefault();

        if (!selectedInterview) {
            toast.error('No interview selected');
            return;
        }

        try {
            setSubmitting(true);

            // Combine date and time into a single datetime string
            const scheduledDateTime = `${rescheduleData.scheduled_date}T${rescheduleData.scheduled_time}`;

            const reschedulePayload = {
                scheduled_date: scheduledDateTime,
                notes: rescheduleData.notes
            };

            await interviewService.rescheduleInterview(selectedInterview._id, reschedulePayload);
            toast.success('Interview rescheduled successfully');
            setShowRescheduleModal(false);
            setSelectedInterview(null);
            setRescheduleData({
                scheduled_date: '',
                scheduled_time: '',
                notes: ''
            });
            fetchData();
        } catch (error) {
            console.error('Error rescheduling interview:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to reschedule interview');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelInterview = (interview) => {
        setSelectedInterview(interview);
        setCancelData({
            feedback: '',
            notes: '',
            candidateStatus: 'Interview Eligible'
        });
        setShowCancelModal(true);
    };

    const handleSubmitCancel = async (e) => {
        e.preventDefault();

        if (!selectedInterview) {
            toast.error('No interview selected');
            return;
        }

        try {
            setSubmitting(true);

            await interviewService.cancelInterview(selectedInterview._id, cancelData);
            toast.success('Interview cancelled successfully');
            setShowCancelModal(false);
            setSelectedInterview(null);
            setCancelData({
                feedback: '',
                notes: '',
                candidateStatus: 'Interview Eligible'
            });
            fetchData();
        } catch (error) {
            console.error('Error cancelling interview:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to cancel interview');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getResultBadge = (result) => {
        const colors = {
            'Pending': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'Rescheduled': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
            'Taken': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            'Passed': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'Failed': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            'No Show': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
            'Cancelled': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            'Completed': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[result] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                {result}
            </span>
        );
    };

    // Filter active interviews (Pending, Rescheduled, Taken) based on search and filter criteria
    const activeInterviews = interviews.filter(interview => {
        const candidate = interview.candidate_id;
        if (!candidate) return false;

        // Only include interviews with status Pending, Rescheduled, or Taken
        const isActiveStatus = ['Pending', 'Rescheduled', 'Taken'].includes(interview.status || interview.result);
        if (!isActiveStatus) return false;

        const matchesSearch = candidate.name?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
            candidate.email?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
            candidate.application_id?.toLowerCase().includes(activeSearchTerm.toLowerCase());

        const matchesStatus = !activeStatusFilter || interview.status === activeStatusFilter;

        const matchesJob = !activeJobFilter || candidate.job_id?.job_id === activeJobFilter;

        const matchesDate = !activeDateFilter ||
            new Date(interview.scheduled_date).toDateString() === new Date(activeDateFilter).toDateString();

        const matchesLocation = !activeLocationFilter || interview.location === activeLocationFilter;

        return matchesSearch && matchesStatus && matchesJob && matchesDate && matchesLocation;
    });

    // Filter all interviews for table based on search and filter criteria
    const filteredInterviews = interviews.filter(interview => {
        const candidate = interview.candidate_id;
        if (!candidate) return false;

        const matchesSearch = candidate.name?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
            candidate.email?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
            candidate.application_id?.toLowerCase().includes(tableSearchTerm.toLowerCase());

        const matchesStatus = !tableStatusFilter || interview.status === tableStatusFilter;

        const matchesJob = !tableJobFilter || candidate.job_id?.job_id === tableJobFilter;

        const matchesDate = !tableDateFilter ||
            new Date(interview.scheduled_date).toDateString() === new Date(tableDateFilter).toDateString();

        const matchesLocation = !tableLocationFilter || interview.location === tableLocationFilter;

        return matchesSearch && matchesStatus && matchesJob && matchesDate && matchesLocation;
    });

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Interviews</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
                        Manage and track candidate interviews
                    </p>
                </div>

            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">T</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Interviews</dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">{interviews.length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">P</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending</dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                        {interviews.filter(i => i.status === 'Pending').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">C</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completed</dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                        {interviews.filter(i => i.status === 'Completed').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">S</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Passed</dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                        {interviews.filter(i => i.status === 'Passed').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-red-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">F</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Failed</dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                        {interviews.filter(i => i.status === 'Failed').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Interviews Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Interviews</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending, Rescheduled, and Taken interviews</p>
                        </div>
                    </div>

                    {/* Active Interviews Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search active interviews..."
                                    value={activeSearchTerm}
                                    onChange={(e) => setActiveSearchTerm(e.target.value)}
                                    className="pl-10 pr-12 sm:pr-10 input"
                                />
                                <button
                                    onClick={() => setShowActiveFilters(!showActiveFilters)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 sm:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                                >
                                    <FunnelIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="hidden sm:flex gap-2">
                            <button
                                onClick={() => setShowActiveFilters(!showActiveFilters)}
                                className="btn btn-secondary flex items-center"
                            >
                                <FunnelIcon className="h-5 w-5 mr-2" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {showActiveFilters && (
                        <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Interview Status
                                    </label>
                                    <select
                                        value={activeStatusFilter}
                                        onChange={(e) => setActiveStatusFilter(e.target.value)}
                                        className="input"
                                    >
                                        <option value="">All Active Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Rescheduled">Rescheduled</option>
                                        <option value="Taken">Taken</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Job (Active only)
                                    </label>
                                    <select
                                        value={activeJobFilter}
                                        onChange={(e) => setActiveJobFilter(e.target.value)}
                                        className="input"
                                    >
                                        <option value="">All Jobs</option>
                                        {jobs.map((job) => (
                                            <option key={job._id} value={job.job_id}>
                                                {job.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Interview Date
                                    </label>
                                    <input
                                        type="date"
                                        value={activeDateFilter}
                                        onChange={(e) => setActiveDateFilter(e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Location
                                    </label>
                                    <select
                                        value={activeLocationFilter}
                                        onChange={(e) => setActiveLocationFilter(e.target.value)}
                                        className="input"
                                    >
                                        <option value="">All Locations</option>
                                        <option value="Online">Online</option>
                                        <option value="In-Person">In-Person</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Interviews Content */}
                    {activeInterviews.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {activeInterviews.map((interview) => (
                                <div key={interview._id} className="card">
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <CalendarIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                                                <div>
                                                    <Link to={`/admin/candidates/${interview.candidate_id._id}`} className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {interview.candidate_id?.name || 'Unknown Candidate'}
                                                    </Link>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {interview.job_id?.title || interview.job?.title || 'Unknown Position'}
                                                    </p>
                                                </div>
                                            </div>
                                            {getResultBadge(interview.status || interview.result)}
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">Application ID:</span> {interview.candidate_id?.application_id || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">Email:</span> {interview.candidate_id?.email || 'N/A'}
                                            </p>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <ClockIcon className="h-4 w-4 mr-2" />
                                                {new Date(interview.scheduled_date).toLocaleDateString()} at{' '}
                                                {new Date(interview.scheduled_date).toLocaleTimeString()}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <UserIcon className="h-4 w-4 mr-2" />
                                                {interview.interviewer?.name || 'TBD'}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">Location:</span> {interview.location || 'In-Person'}
                                            </div>
                                            {interview.location === 'Online' && interview.meeting_link && (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                    <span className="font-medium">Meeting Link:</span>
                                                    <a
                                                        href={interview.meeting_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                                    >
                                                        Join Meeting
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {interview.feedback && (
                                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-medium">Feedback:</span> {interview.feedback}
                                                </p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                            {/* 3 Buttons for Interview Scheduled + Pending/Rescheduled */}
                                            {interview.candidate_id?.status === 'Interview Scheduled' && (interview.result === 'Pending' || interview.result === 'Rescheduled') && (
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        onClick={() => handleCancelInterview(interview)}
                                                        className="btn btn-danger text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleRescheduleInterview(interview)}
                                                        className="btn btn-secondary text-sm"
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button
                                                        onClick={() => handleCompleteInterview(interview)}
                                                        className="btn btn-success text-sm"
                                                    >
                                                        Complete
                                                    </button>
                                                </div>
                                            )}

                                            {/* Other conditions */}
                                            {interview.result === 'Pending' && interview.candidate_id?.status !== 'Interview Scheduled' && (
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => handleCompleteInterview(interview)}
                                                        className="w-full btn btn-success text-sm"
                                                    >
                                                        Complete Interview
                                                    </button>
                                                </div>
                                            )}
                                            {interview.candidate_id?.status === 'Interview Completed' && interview.result === 'Taken' && (
                                                <div className="flex flex-row gap-2">
                                                    <button
                                                        onClick={() => handleCompleteInterview(interview)}
                                                        className="w-full btn btn-success text-sm"
                                                    >
                                                        Complete Interview
                                                    </button>
                                                    <button
                                                        onClick={() => handleScheduleNextInterview(interview)}
                                                        className="w-full btn btn-primary text-sm"
                                                    >
                                                        Schedule Next Interview
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                {activeSearchTerm || activeStatusFilter || activeJobFilter || activeDateFilter || activeLocationFilter
                                    ? 'No active interviews match your current filters.'
                                    : 'No active interviews found'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {activeSearchTerm || activeStatusFilter || activeJobFilter || activeDateFilter || activeLocationFilter
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'All interviews have been completed or are not in active status.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* All Interviews Table Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Interviews</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Complete list of all interviews with filtering options</p>
                        </div>
                    </div>

                    {/* Table Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search all interviews..."
                                    value={tableSearchTerm}
                                    onChange={(e) => setTableSearchTerm(e.target.value)}
                                    className="pl-10 pr-12 sm:pr-10 input"
                                />
                                <button
                                    onClick={() => setShowTableFilters(!showTableFilters)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 sm:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                                >
                                    <FunnelIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="hidden sm:flex gap-2">
                            <button
                                onClick={() => setShowTableFilters(!showTableFilters)}
                                className="btn btn-secondary flex items-center"
                            >
                                <FunnelIcon className="h-5 w-5 mr-2" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {showTableFilters && (
                        <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Interview Status
                                    </label>
                                    <select
                                        value={tableStatusFilter}
                                        onChange={(e) => setTableStatusFilter(e.target.value)}
                                        className="input"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Rescheduled">Rescheduled</option>
                                        <option value="Taken">Taken</option>
                                        <option value="Passed">Passed</option>
                                        <option value="Failed">Failed</option>
                                        <option value="No Show">No Show</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Job (Active only)
                                    </label>
                                    <select
                                        value={tableJobFilter}
                                        onChange={(e) => setTableJobFilter(e.target.value)}
                                        className="input"
                                    >
                                        <option value="">All Jobs</option>
                                        {jobs.map((job) => (
                                            <option key={job._id} value={job.job_id}>
                                                {job.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Interview Date
                                    </label>
                                    <input
                                        type="date"
                                        value={tableDateFilter}
                                        onChange={(e) => setTableDateFilter(e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Location
                                    </label>
                                    <select
                                        value={tableLocationFilter}
                                        onChange={(e) => setTableLocationFilter(e.target.value)}
                                        className="input"
                                    >
                                        <option value="">All Locations</option>
                                        <option value="Online">Online</option>
                                        <option value="In-Person">In-Person</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* All Interviews Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        No.
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Candidate
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Application ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Job
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Interview Date & Time
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Interviewer
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {filteredInterviews.map((interview, i) => (
                                    <tr key={interview._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {i + 1}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        <Link to={`/admin/candidates/${interview.candidate_id._id}`} className="hover:underline">
                                                            {interview.candidate_id?.name || 'Unknown Candidate'}
                                                        </Link>
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {interview.candidate_id?.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {interview.candidate_id?.application_id || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div>
                                                <div className="font-medium">
                                                    {interview.job_id?.title || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {interview.job_id?.experience_in_year || 'N/A'} experience
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div>
                                                <div className="font-medium">
                                                    {new Date(interview.scheduled_date).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(interview.scheduled_date).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {interview.interviewer?.name || 'TBD'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {interview.location || 'In-Person'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {getResultBadge(interview.status || interview.result)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/admin/candidates/${interview.candidate_id._id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    title="View Candidate Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                {['Pending', 'Rescheduled', 'Taken'].includes(interview.status || interview.result) && (
                                                    <>
                                                        <button
                                                            onClick={() => handleCompleteInterview(interview)}
                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            title="Complete Interview"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </button>
                                                        {interview.status === 'Pending' || interview.result === 'Pending' ? (
                                                            <button
                                                                onClick={() => handleRescheduleInterview(interview)}
                                                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                                                title="Reschedule Interview"
                                                            >
                                                                <ArrowPathIcon className="h-4 w-4" />
                                                            </button>
                                                        ) : null}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredInterviews.length === 0 && (
                        <div className="text-center py-12">
                            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                {tableSearchTerm || tableStatusFilter || tableJobFilter || tableDateFilter || tableLocationFilter
                                    ? 'No interviews match your current filters.'
                                    : 'No interviews found'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {tableSearchTerm || tableStatusFilter || tableJobFilter || tableDateFilter || tableLocationFilter
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by scheduling an interview for eligible candidates.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>



            {/* Complete Interview Modal */}
            {showCompleteModal && selectedInterview && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl sm:max-w-lg">
                            <form onSubmit={handleSubmitCompleteInterview}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                                                Complete Interview - {selectedInterview.candidate_id?.name}
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Candidate Status *
                                                    </label>
                                                    <select
                                                        value={completeFormData.candidateStatus}
                                                        onChange={(e) => setCompleteFormData({ ...completeFormData, candidateStatus: e.target.value })}
                                                        className="mt-1 input"
                                                        required
                                                    >
                                                        <option value="Interview Completed">Interview Completed</option>
                                                        <option value="Shortlisted">Shortlisted</option>
                                                    </select>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Update candidate's application status
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Interview Result *
                                                    </label>
                                                    <select
                                                        value={completeFormData.interviewResult}
                                                        onChange={(e) => setCompleteFormData({ ...completeFormData, interviewResult: e.target.value })}
                                                        className="mt-1 input"
                                                        required
                                                    >
                                                        <option value="Taken">Taken (Under Evaluation)</option>
                                                        <option value="Passed">Passed</option>
                                                        <option value="Failed">Failed</option>
                                                        <option value="No Show">No Show</option>
                                                    </select>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Interview result status
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Interview Status *
                                                    </label>
                                                    <select
                                                        value={completeFormData.interviewStatus}
                                                        onChange={(e) => setCompleteFormData({ ...completeFormData, interviewStatus: e.target.value })}
                                                        className="mt-1 input"
                                                        required
                                                    >
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Interview status for tracking
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Feedback (Visible to Candidate)
                                                    </label>
                                                    <textarea
                                                        value={completeFormData.feedback}
                                                        onChange={(e) => setCompleteFormData({ ...completeFormData, feedback: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 input"
                                                        placeholder="Provide feedback that will be visible to the candidate..."
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        This feedback will be shown to the candidate in their portal
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Admin Notes (Internal)
                                                    </label>
                                                    <textarea
                                                        value={completeFormData.notes}
                                                        onChange={(e) => setCompleteFormData({ ...completeFormData, notes: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 input"
                                                        placeholder="Internal notes for admin reference..."
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        These notes are only visible to admin users
                                                    </p>
                                                </div>

                                                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                                        <span className="font-medium">Note:</span> Interview results will only be visible to the candidate if their status is set to "Shortlisted" or "Rejected".
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCompleteModal(false);
                                            setSelectedInterview(null);
                                            setCompleteFormData({
                                                candidateStatus: 'Interview Completed',
                                                interviewResult: 'Taken',
                                                interviewStatus: 'Completed',
                                                feedback: '',
                                                notes: ''
                                            });
                                        }}
                                        className="btn btn-secondary sm:mt-0 sm:w-auto mr-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn btn-primary sm:w-auto disabled:opacity-50"
                                    >
                                        {submitting ? 'Completing...' : 'Complete Interview'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Next Interview Modal */}
            {showNextInterviewModal && selectedInterview && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl sm:max-w-lg">
                            <form onSubmit={handleSubmitNextInterview}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                                                Schedule Next Interview - {selectedInterview.candidate_id?.name}
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Select Evaluator
                                                    </label>
                                                    <select
                                                        value={nextInterviewData.interviewer}
                                                        onChange={(e) => setNextInterviewData({ ...nextInterviewData, interviewer: e.target.value })}
                                                        className="mt-1 input"
                                                        required
                                                    >
                                                        <option value="">Choose an evaluator...</option>
                                                        {evaluators.map((evaluator) => (
                                                            <option key={evaluator._id} value={evaluator._id}>
                                                                {evaluator.name}{evaluator.department ? ` - ${evaluator.department}` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Interview Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={nextInterviewData.scheduled_date}
                                                        onChange={(e) => setNextInterviewData({ ...nextInterviewData, scheduled_date: e.target.value })}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="mt-1 input"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Interview Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={nextInterviewData.scheduled_time}
                                                        onChange={(e) => setNextInterviewData({ ...nextInterviewData, scheduled_time: e.target.value })}
                                                        className="mt-1 input"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Interview Location
                                                    </label>
                                                    <select
                                                        value={nextInterviewData.location}
                                                        onChange={(e) => setNextInterviewData({ ...nextInterviewData, location: e.target.value })}
                                                        className="mt-1 input"
                                                        required
                                                    >
                                                        <option value="In-Person">In-Person</option>
                                                        <option value="Online">Online</option>
                                                    </select>
                                                </div>

                                                {nextInterviewData.location === 'Online' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Meeting Link
                                                        </label>
                                                        <input
                                                            type="url"
                                                            value={nextInterviewData.meeting_link}
                                                            onChange={(e) => setNextInterviewData({ ...nextInterviewData, meeting_link: e.target.value })}
                                                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                            className="mt-1 input"
                                                            required={nextInterviewData.location === 'Online'}
                                                        />
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Feedback
                                                    </label>
                                                    <textarea
                                                        value={nextInterviewData.feedback}
                                                        onChange={(e) => setNextInterviewData({ ...nextInterviewData, feedback: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 input"
                                                        placeholder="Additional feedback for the interview..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Notes
                                                    </label>
                                                    <textarea
                                                        value={nextInterviewData.notes}
                                                        onChange={(e) => setNextInterviewData({ ...nextInterviewData, notes: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 input"
                                                        placeholder="Additional notes for the interview..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNextInterviewModal(false);
                                            setSelectedInterview(null);
                                            setNextInterviewData({
                                                candidate_id: '',
                                                job_id: '',
                                                scheduled_date: '',
                                                scheduled_time: '',
                                                interviewer: '',
                                                location: 'In-Person',
                                                meeting_link: '',
                                                notes: ''
                                            });
                                        }}
                                        className="btn btn-secondary sm:mt-0 sm:w-auto mr-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn btn-primary sm:w-auto disabled:opacity-50"
                                    >
                                        {submitting ? 'Scheduling...' : 'Schedule Next Interview'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Interview Modal */}
            {showRescheduleModal && selectedInterview && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl sm:max-w-lg">
                            <form onSubmit={handleSubmitReschedule}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                                                Reschedule Interview - {selectedInterview.candidate_id?.name}
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        New Interview Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={rescheduleData.scheduled_date}
                                                        onChange={(e) => setRescheduleData({ ...rescheduleData, scheduled_date: e.target.value })}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="mt-1 input"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        New Interview Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={rescheduleData.scheduled_time}
                                                        onChange={(e) => setRescheduleData({ ...rescheduleData, scheduled_time: e.target.value })}
                                                        className="mt-1 input"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Notes
                                                    </label>
                                                    <textarea
                                                        value={rescheduleData.notes}
                                                        onChange={(e) => setRescheduleData({ ...rescheduleData, notes: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 input"
                                                        placeholder="Reason for rescheduling..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowRescheduleModal(false);
                                            setSelectedInterview(null);
                                            setRescheduleData({
                                                scheduled_date: '',
                                                scheduled_time: '',
                                                notes: ''
                                            });
                                        }}
                                        className="btn btn-secondary sm:mt-0 sm:w-auto mr-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn btn-primary sm:w-auto disabled:opacity-50"
                                    >
                                        {submitting ? 'Rescheduling...' : 'Reschedule Interview'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Interview Modal */}
            {showCancelModal && selectedInterview && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl sm:max-w-lg">
                            <form onSubmit={handleSubmitCancel}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                                                Cancel Interview - {selectedInterview.candidate_id?.name}
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Candidate Status *
                                                    </label>
                                                    <select
                                                        value={cancelData.candidateStatus}
                                                        onChange={(e) => setCancelData({ ...cancelData, candidateStatus: e.target.value })}
                                                        className="mt-1 input"
                                                        required
                                                    >
                                                        <option value="Interview Eligible">Interview Eligible</option>
                                                        <option value="Interview Scheduled">Interview Scheduled</option>
                                                        <option value="Interview Completed">Interview Completed</option>
                                                        <option value="Shortlisted">Shortlisted</option>
                                                        <option value="Selected">Selected</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Update candidate's application status after cancellation
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Feedback (Visible to Candidate)
                                                    </label>
                                                    <textarea
                                                        value={cancelData.feedback}
                                                        onChange={(e) => setCancelData({ ...cancelData, feedback: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 input"
                                                        placeholder="Provide feedback that will be visible to the candidate..."
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        This feedback will be shown to the candidate in their portal
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Admin Notes (Internal)
                                                    </label>
                                                    <textarea
                                                        value={cancelData.notes}
                                                        onChange={(e) => setCancelData({ ...cancelData, notes: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 input"
                                                        placeholder="Internal notes for admin reference..."
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        These notes are only visible to admin users
                                                    </p>
                                                </div>

                                                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
                                                    <p className="text-sm text-red-800 dark:text-red-200">
                                                        <span className="font-medium">Warning:</span> This action will cancel the interview and set the result to "Cancelled". This action cannot be undone.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCancelModal(false);
                                            setSelectedInterview(null);
                                            setCancelData({
                                                feedback: '',
                                                notes: '',
                                                candidateStatus: 'Interview Eligible'
                                            });
                                        }}
                                        className="btn btn-secondary sm:mt-0 sm:w-auto mr-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn btn-danger sm:w-auto disabled:opacity-50"
                                    >
                                        {submitting ? 'Cancelling...' : 'Cancel Interview'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interviews;
