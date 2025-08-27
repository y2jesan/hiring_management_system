import {
    CalendarIcon,
    ClockIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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

    const handleCompleteInterview = async (interviewId, candidateId) => {
        if (!confirm('Are you sure you want to mark this interview as completed? This will update the candidate status to "Interview Completed".')) {
            return;
        }

        try {
            await interviewService.completeInterview(interviewId, candidateId);
            toast.success('Interview completed successfully');
            fetchData();
        } catch (error) {
            console.error('Error completing interview:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to complete interview');
            }
        }
    };

    const getResultBadge = (result) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Passed': 'bg-green-100 text-green-800',
            'Failed': 'bg-red-100 text-red-800',
            'No Show': 'bg-gray-100 text-gray-800',
            'Completed': 'bg-blue-100 text-blue-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[result] || 'bg-gray-100 text-gray-800'}`}>
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

        const matchesStatus = !statusFilter || interview.result === statusFilter;

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
                    <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Schedule and manage candidate interviews
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Schedule Interview
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by candidate name, email, or application ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 input"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
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
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Interview Result
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="input"
                                    >
                                        <option value="">All Results</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Passed">Passed</option>
                                        <option value="Failed">Failed</option>
                                        <option value="No Show">No Show</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">T</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Interviews</dt>
                                    <dd className="text-lg font-medium text-gray-900">{interviews.length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">P</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {interviews.filter(i => i.result === 'Pending').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">C</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {interviews.filter(i => i.result === 'Completed').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">S</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Passed</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {interviews.filter(i => i.result === 'Passed').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-red-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">F</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {interviews.filter(i => i.result === 'Failed').length}
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
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-8 w-8 text-primary-600 mr-3" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {interview.candidate_id?.name || 'Unknown Candidate'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {interview.job_id?.title || interview.job?.title || 'Unknown Position'}
                                            </p>
                                        </div>
                                    </div>
                                    {getResultBadge(interview.result)}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Application ID:</span> {interview.candidate_id?.application_id || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Email:</span> {interview.candidate_id?.email || 'N/A'}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <ClockIcon className="h-4 w-4 mr-2" />
                                        {new Date(interview.scheduled_date).toLocaleDateString()} at{' '}
                                        {new Date(interview.scheduled_date).toLocaleTimeString()}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        {interview.interviewer?.name || 'TBD'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium">Location:</span> {interview.location || 'In-Person'}
                                    </div>
                                    {interview.location === 'Online' && interview.meeting_link && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <span className="font-medium">Meeting Link:</span>
                                            <a
                                                href={interview.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-1 text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Join Meeting
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {interview.feedback && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Feedback:</span> {interview.feedback}
                                        </p>
                                    </div>
                                )}

                                {/* Complete Interview Button */}
                                {interview.result === 'Pending' && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleCompleteInterview(interview._id, interview.candidate_id._id)}
                                            className="w-full btn btn-success text-sm"
                                        >
                                            Complete Interview
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {searchTerm || statusFilter || jobFilter || dateFilter || locationFilter
                            ? 'No interviews match your current filters.'
                            : 'No interviews scheduled'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || statusFilter || jobFilter || dateFilter || locationFilter
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Get started by scheduling an interview for eligible candidates.'}
                    </p>
                </div>
            )}

            {/* Eligible Candidates Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Eligible Candidates for Interview</h3>
                            <p className="text-sm text-gray-500">Candidates who are eligible for interview scheduling</p>
                        </div>
                    </div>

                    {/* Eligible Candidates Filters */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Candidate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Application ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Job
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Task Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Applied Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {candidates.map((candidate) => (
                                    <tr key={candidate._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-primary-700">
                                                            {candidate.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {candidate.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {candidate.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {candidate.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {candidate.application_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div className="font-medium">
                                                    {candidate.job_id?.title || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {candidate.job_id?.experience_in_year || 'N/A'} experience
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Interview Eligible
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {candidate.evaluation?.score ? `${candidate.evaluation.score}%` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(candidate.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No eligible candidates found</h3>
                            <p className="mt-1 text-sm text-gray-500">
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
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleScheduleInterview}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                Schedule Interview
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
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
                                                    <label className="block text-sm font-medium text-gray-700">
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
                                                    <label className="block text-sm font-medium text-gray-700">
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
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Select a future date for the interview
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Interview Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={interviewTime}
                                                        onChange={(e) => setInterviewTime(e.target.value)}
                                                        className="mt-1 input"
                                                        required
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Select the time for the interview
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
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
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Select the interview location type
                                                    </p>
                                                </div>

                                                {interviewLocation === 'Online' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
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
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Enter the meeting link for online interview
                                                        </p>
                                                    </div>
                                                )}

                                                {interviewDate && interviewTime && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <p className="text-sm text-blue-800">
                                                            <span className="font-medium">Scheduled for:</span>{' '}
                                                            {new Date(`${interviewDate}T${interviewTime}`).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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
        </div>
    );
};

export default Interviews;
