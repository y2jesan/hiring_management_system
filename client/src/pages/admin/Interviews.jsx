import {
    CalendarIcon,
    ClockIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { ClockPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { candidateService } from '../../services/candidateService';
import { interviewService } from '../../services/interviewService';
import { jobService } from '../../services/jobService';
import { userService } from '../../services/userService';

const Interviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [evaluators, setEvaluators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [selectedEvaluator, setSelectedEvaluator] = useState('');
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [interviewLocation, setInterviewLocation] = useState('In-Person');
    const [meetingLink, setMeetingLink] = useState('');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

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
            const [interviewsData, candidatesData, jobsData, evaluatorsData] = await Promise.all([
                interviewService.getAllInterviews(),
                candidateService.getAllCandidates({ status: 'Interview Eligible' }),
                jobService.getAllJobs({ is_active: true }),
                userService.getAllUsers({ role: 'Evaluator', is_active: true })
            ]);

            // Handle different response structures
            const interviewsArray = interviewsData.data?.interviews || interviewsData.interviews || [];
            const candidatesArray = candidatesData.data?.candidates || candidatesData.candidates || [];
            const jobsArray = jobsData.data?.jobs || jobsData.jobs || [];
            const evaluatorsArray = evaluatorsData.data?.users || evaluatorsData.users || [];

            setInterviews(Array.isArray(interviewsArray) ? interviewsArray : []);
            setCandidates(Array.isArray(candidatesArray) ? candidatesArray : []);
            setJobs(Array.isArray(jobsArray) ? jobsArray : []);
            setEvaluators(Array.isArray(evaluatorsArray) ? evaluatorsArray : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
            setInterviews([]);
            setCandidates([]);
            setJobs([]);
            setEvaluators([]);
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        if (!selectedCandidate || !selectedEvaluator || !interviewDate || !interviewTime) {
            toast.error('Please fill in all fields');
            return;
        }

        // Validate meeting link for online interviews
        if (interviewLocation === 'Online' && !meetingLink.trim()) {
            toast.error('Meeting link is required for online interviews');
            return;
        }

        try {
            // Format the date and time properly
            const scheduledDateTime = new Date(`${interviewDate}T${interviewTime}`);

            // Validate that the date is in the future
            if (scheduledDateTime <= new Date()) {
                toast.error('Interview must be scheduled for a future date and time');
                return;
            }

            // Get the candidate to extract job_id
            const selectedCandidateData = candidates.find(c => c._id === selectedCandidate);
            if (!selectedCandidateData) {
                toast.error('Candidate data not found');
                return;
            }

            const jobId = selectedCandidateData.job_id?._id || selectedCandidateData.job?._id;
            if (!jobId) {
                toast.error('Candidate job information not found');
                return;
            }

            const interviewData = {
                candidate_id: selectedCandidate,
                job_id: jobId,
                scheduled_date: scheduledDateTime.toISOString(),
                interviewer: selectedEvaluator,
                location: interviewLocation,
                meeting_link: interviewLocation === 'Online' ? meetingLink.trim() : null,
                notes: 'Interview scheduled via admin panel'
            };

            await interviewService.scheduleInterview(interviewData);
            toast.success('Interview scheduled successfully');
            setShowModal(false);
            setSelectedCandidate('');
            setSelectedEvaluator('');
            setInterviewDate('');
            setInterviewTime('');
            setInterviewLocation('In-Person');
            setMeetingLink('');
            fetchData();
        } catch (error) {
            console.error('Error scheduling interview:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to schedule interview');
            }
        }
    };

    const handleCompleteInterview = (interview) => {
        setSelectedInterview(interview);
        setCompleteFormData({
            candidateStatus: 'Interview Completed',
            interviewResult: interview.result || 'Taken',
            interviewStatus: interview.result || 'Taken',
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
                interviewStatus: 'Taken',
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

    // Filter interviews based on search and filter criteria
    const filteredInterviews = interviews.filter(interview => {
        const candidate = interview.candidate_id;
        if (!candidate) return false;

        const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.application_id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = !statusFilter || interview.status === statusFilter;

        const matchesJob = !jobFilter || candidate.job_id?.job_id === jobFilter;

        const matchesDate = !dateFilter ||
            new Date(interview.scheduled_date).toDateString() === new Date(dateFilter).toDateString();

        const matchesLocation = !locationFilter || interview.location === locationFilter;

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
                        Schedule and manage candidate interviews
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary flex items-center h-12 w-12 lg:h-10 lg:w-auto lg:px-4 justify-center lg:justify-start"
                >
                    <ClockPlus className="h-6 w-6 lg:h-5 lg:w-5 lg:mr-2" />
                    <span className="hidden lg:inline">Schedule Interview</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by candidate name, email, or application ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-12 sm:pr-10 input"
                                />
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 sm:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                                >
                                    <FunnelIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="hidden sm:flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="btn btn-secondary flex items-center"
                            >
                                <FunnelIcon className="h-5 w-5 mr-2" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Interview Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
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
                                        value={jobFilter}
                                        onChange={(e) => setJobFilter(e.target.value)}
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
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Location
                                    </label>
                                    <select
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter(e.target.value)}
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

            {/* Interviews Content */}
            {filteredInterviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredInterviews.map((interview) => (
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
                        {searchTerm || statusFilter || jobFilter || dateFilter || locationFilter
                            ? 'No interviews match your current filters.'
                            : 'No interviews scheduled'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm || statusFilter || jobFilter || dateFilter || locationFilter
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Get started by scheduling an interview for eligible candidates.'}
                    </p>
                </div>
            )}

            {/* Eligible Candidates Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Eligible Candidates for Interview</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Candidates who are eligible for interview scheduling</p>
                        </div>
                    </div>

                    {/* Eligible Candidates Filters */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search eligible candidates..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Eligible Candidates Table */}
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
                                        Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Task Score
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Applied Date
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {candidates.map((candidate, i) => (
                                    <tr key={candidate._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {i + 1}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {/* <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-primary-700 dark:text-primary-200">
                                                            {candidate.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div> */}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {candidate.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {candidate.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {candidate.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {candidate.application_id}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div>
                                                <div className="font-medium">
                                                    {candidate.job_id?.title || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {candidate.job_id?.experience_in_year || 'N/A'} experience
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                Interview Eligible
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {candidate.evaluation?.score ? `${candidate.evaluation.score}%` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(candidate.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedCandidate(candidate._id);
                                                    setSelectedEvaluator('');
                                                    setShowModal(true);
                                                }}
                                                className="btn btn-primary text-sm"
                                            >
                                                Schedule Interview
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {candidates.length === 0 && (
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No eligible candidates found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                No candidates are currently eligible for interview scheduling.
                            </p>
                        </div>
                    )}
                </div>
            </div>



            {/* Schedule Interview Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleScheduleInterview}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                                                Schedule Interview
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Select Candidate
                                                    </label>
                                                    <select
                                                        value={selectedCandidate}
                                                        onChange={(e) => setSelectedCandidate(e.target.value)}
                                                        className="mt-1 input"
                                                        required
                                                    >
                                                        <option value="">Choose a candidate...</option>
                                                        {candidates.map((candidate) => (
                                                            <option key={candidate._id} value={candidate._id}>
                                                                {candidate.name} - {candidate.job_id?.title || candidate.job?.title || 'N/A'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Select Evaluator
                                                    </label>
                                                    <select
                                                        value={selectedEvaluator}
                                                        onChange={(e) => setSelectedEvaluator(e.target.value)}
                                                        className="mt-1 input"
                                                        required
                                                    >
                                                        <option value="">Choose an evaluator...</option>
                                                        {evaluators.map((evaluator) => (
                                                            <option key={evaluator._id} value={evaluator._id}>
                                                                {evaluator.name} - {evaluator.department || 'No Department'}
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
                                                        value={interviewDate}
                                                        onChange={(e) => setInterviewDate(e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="mt-1 input"
                                                        required
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Select a future date for the interview
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Interview Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={interviewTime}
                                                        onChange={(e) => setInterviewTime(e.target.value)}
                                                        className="mt-1 input"
                                                        required
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Select the time for the interview
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Interview Location
                                                    </label>
                                                    <select
                                                        value={interviewLocation}
                                                        onChange={(e) => setInterviewLocation(e.target.value)}
                                                        className="mt-1 input"
                                                        required
                                                    >
                                                        <option value="In-Person">In-Person</option>
                                                        <option value="Online">Online</option>
                                                    </select>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Select the interview location type
                                                    </p>
                                                </div>

                                                {interviewLocation === 'Online' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Meeting Link
                                                        </label>
                                                        <input
                                                            type="url"
                                                            value={meetingLink}
                                                            onChange={(e) => setMeetingLink(e.target.value)}
                                                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                            className="mt-1 input"
                                                            required={interviewLocation === 'Online'}
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            Enter the meeting link for online interview
                                                        </p>
                                                    </div>
                                                )}

                                                {interviewDate && interviewTime && (
                                                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                                            <span className="font-medium">Scheduled for:</span>{' '}
                                                            {new Date(`${interviewDate}T${interviewTime}`).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="btn btn-primary sm:ml-3 sm:w-auto"
                                    >
                                        Schedule Interview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedCandidate('');
                                            setSelectedEvaluator('');
                                            setInterviewDate('');
                                            setInterviewTime('');
                                            setInterviewLocation('In-Person');
                                            setMeetingLink('');
                                        }}
                                        className="btn btn-secondary sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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
                                                        <option value="Cancelled">Cancelled</option>
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
                                                interviewResult: 'Pending',
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
                                                                {evaluator.name} - {evaluator.department || 'No Department'}
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
