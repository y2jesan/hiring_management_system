import {
    CalendarIcon,
    ClockIcon,
    PlusIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { candidateService } from '../../services/candidateService';
import { interviewService } from '../../services/interviewService';

const Interviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [interviewsData, candidatesData] = await Promise.all([
                interviewService.getAllInterviews(),
                candidateService.getAllCandidates({ status: 'Interview Eligible' })
            ]);
            setInterviews(interviewsData.data || []);
            setCandidates(candidatesData.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        if (!selectedCandidate || !interviewDate || !interviewTime) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const interviewData = {
                candidate_id: selectedCandidate,
                scheduled_date: `${interviewDate}T${interviewTime}`,
                interviewer: 'HR Manager' // This would be dynamic in a real app
            };

            await interviewService.scheduleInterview(selectedCandidate, interviewData);
            toast.success('Interview scheduled successfully');
            setShowModal(false);
            setSelectedCandidate('');
            setInterviewDate('');
            setInterviewTime('');
            fetchData();
        } catch (error) {
            console.error('Error scheduling interview:', error);
            toast.error('Failed to schedule interview');
        }
    };

    const getResultBadge = (result) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Passed': 'bg-green-100 text-green-800',
            'Failed': 'bg-red-100 text-red-800',
            'No Show': 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[result] || 'bg-gray-100 text-gray-800'}`}>
                {result}
            </span>
        );
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

            {/* Interviews Content */}
            {interviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {interviews.map((interview) => (
                        <div key={interview._id} className="card">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-8 w-8 text-primary-600 mr-3" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {interview.candidate?.name || 'Unknown Candidate'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {interview.candidate?.job?.title || 'Unknown Position'}
                                            </p>
                                        </div>
                                    </div>
                                    {getResultBadge(interview.result)}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <ClockIcon className="h-4 w-4 mr-2" />
                                        {new Date(interview.scheduled_date).toLocaleDateString()} at{' '}
                                        {new Date(interview.scheduled_date).toLocaleTimeString()}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        {interview.interviewer || 'TBD'}
                                    </div>
                                </div>

                                {interview.feedback && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Feedback:</span> {interview.feedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No interviews scheduled</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by scheduling an interview for eligible candidates.
                    </p>
                </div>
            )}

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
                                                                {candidate.name} - {candidate.job?.title}
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
                                                        className="mt-1 input"
                                                        required
                                                    />
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
                                                </div>
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
                                            setInterviewDate('');
                                            setInterviewTime('');
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
