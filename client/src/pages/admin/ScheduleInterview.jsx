import {
    CalendarIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { ClockPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';
import { userService } from '../../services/userService';

const ScheduleInterview = () => {
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
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [candidatesData, jobsData, evaluatorsData, mdUsersData] = await Promise.all([
                candidateService.getAllCandidates({ status: 'Interview Eligible' }),
                jobService.getAllJobs({ is_active: true }),
                userService.getAllUsers({ role: 'Evaluator', is_active: true }),
                userService.getAllUsers({ role: 'MD', is_active: true })
            ]);

            // Handle different response structures
            const candidatesArray = candidatesData.data?.candidates || candidatesData.candidates || [];
            const jobsArray = jobsData.data?.jobs || jobsData.jobs || [];
            const evaluatorsArray = evaluatorsData.data?.users || evaluatorsData.users || [];
            const mdUsersArray = mdUsersData.data?.users || mdUsersData.users || [];

            // Combine evaluators and MD users
            const allEvaluators = [
                ...(Array.isArray(evaluatorsArray) ? evaluatorsArray : []),
                ...(Array.isArray(mdUsersArray) ? mdUsersArray : [])
            ];

            setCandidates(Array.isArray(candidatesArray) ? candidatesArray : []);
            setJobs(Array.isArray(jobsArray) ? jobsArray : []);
            setEvaluators(allEvaluators);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
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
            setSubmitting(true);
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

            // Import interviewService dynamically to avoid circular dependencies
            const { interviewService } = await import('../../services/interviewService');
            await interviewService.scheduleInterview(interviewData);

            toast.success('Interview scheduled successfully');
            setShowModal(false);
            setSelectedCandidate('');
            setSelectedEvaluator('');
            setInterviewDate('');
            setInterviewTime('');
            setInterviewLocation('In-Person');
            setMeetingLink('');
            fetchData(); // Refresh the candidates list
        } catch (error) {
            console.error('Error scheduling interview:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to schedule interview');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Filter candidates based on search term
    const filteredCandidates = candidates.filter(candidate => {
        const searchLower = searchTerm.toLowerCase();
        return (
            candidate.name?.toLowerCase().includes(searchLower) ||
            candidate.email?.toLowerCase().includes(searchLower) ||
            candidate.application_id?.toLowerCase().includes(searchLower) ||
            candidate.job_id?.title?.toLowerCase().includes(searchLower)
        );
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
                    <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Schedule Interview</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
                        Schedule interviews for eligible candidates
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

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">E</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Eligible Candidates</dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">{candidates.length}</dd>
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
                                    <span className="text-white text-sm font-medium">J</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Jobs</dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">{jobs.length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">I</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Interviewers</dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">{evaluators.length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Eligible Candidates Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Eligible Candidates for Interview</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Candidates who are eligible for interview scheduling</p>
                        </div>
                    </div>

                    {/* Search */}
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
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {filteredCandidates.map((candidate, i) => (
                                    <tr key={candidate._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {i + 1}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        <Link to={`/admin/candidates/${candidate._id}`} className="hover:underline">{candidate.name}</Link>
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {candidate.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {candidate.phone}
                                                    </div>
                                                    <Link to={`/application/${candidate.application_id}`} target='_blank' className="hover:underline">{candidate.application_id}</Link>
                                                </div>
                                            </div>
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
                                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedCandidate(candidate._id);
                                                    setSelectedEvaluator('');
                                                    setShowModal(true);
                                                }}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                                                title="Schedule Interview"
                                            >
                                                <CalendarIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCandidates.length === 0 && (
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                {searchTerm ? 'No candidates match your search.' : 'No eligible candidates found'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'Try adjusting your search criteria.' : 'No candidates are currently eligible for interview scheduling.'}
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
                                        disabled={submitting}
                                        className="btn btn-primary sm:ml-3 sm:w-auto disabled:opacity-50"
                                    >
                                        {submitting ? 'Scheduling...' : 'Schedule Interview'}
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

export default ScheduleInterview;
