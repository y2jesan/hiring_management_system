import {
  ClipboardDocumentCheckIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';

const Evaluation = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [submitDateFilter, setSubmitDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesResponse, jobsResponse] = await Promise.all([
        candidateService.getAllCandidates({
          status: ['Task Submitted', 'Under Review']
        }),
        jobService.getAllJobs({ is_active: true })
      ]);
      setCandidates(candidatesResponse.data?.candidates || candidatesResponse.data || []);
      setJobs(jobsResponse.data?.jobs || jobsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !score) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const evaluationData = {
        score: parseInt(score),
        comments: comments
      };

      await candidateService.evaluateCandidate(selectedCandidate._id, evaluationData);
      toast.success('Evaluation submitted successfully');
      setSelectedCandidate(null);
      setScore('');
      setComments('');
      fetchData(); // Refresh the data after evaluation
    } catch (error) {
      console.error('Error evaluating candidate:', error);
      toast.error('Failed to submit evaluation');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Task Submitted': 'bg-purple-100 text-purple-800',
      'Under Review': 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Filter candidates based on search and filter criteria
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.application_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || candidate.status === statusFilter;

    const matchesJob = !jobFilter || candidate.job_id?.job_id === jobFilter;

    const matchesSubmitDate = !submitDateFilter ||
      (candidate.task_submission?.submitted_at &&
        new Date(candidate.task_submission.submitted_at).toDateString() === new Date(submitDateFilter).toDateString());

    return matchesSearch && matchesStatus && matchesJob && matchesSubmitDate;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evaluation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and score candidate task submissions
        </p>
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
                  placeholder="Search by name, email, or application ID..."
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
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input"
                  >
                    <option value="">All Statuses</option>
                    <option value="Task Submitted">Task Submitted</option>
                    <option value="Under Review">Under Review</option>
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
                    Submit Date
                  </label>
                  <input
                    type="date"
                    value={submitDateFilter}
                    onChange={(e) => setSubmitDateFilter(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">T</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Task Submitted</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {candidates.filter(c => c.status === 'Task Submitted').length}
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
                <div className="h-8 w-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">R</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Under Review</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {candidates.filter(c => c.status === 'Under Review').length}
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
                  <span className="text-white text-sm font-medium">T</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {candidates.filter(c => ['Task Submitted', 'Under Review'].includes(c.status)).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Content */}
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCandidates.map((candidate) => (
            <div key={candidate._id} className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <ClipboardDocumentCheckIcon className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                      <Link to={`/admin/candidates/${candidate._id}`} className="text-lg font-semibold text-gray-900">{candidate.name}</Link>
                      <p className="text-sm text-gray-500">{candidate.job_id?.title || 'N/A'}</p>
                    </div>
                  </div>
                  {getStatusBadge(candidate.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Application ID:</span> {candidate.application_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {candidate.email}
                  </p>
                  {candidate.task_submission?.links && candidate.task_submission.links.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Task Links:</span>
                      <div className="mt-1 space-y-1">
                        {candidate.task_submission.links.slice(0, 2).map((link, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${link.type === 'github' ? 'bg-gray-100 text-gray-800' :
                              link.type === 'live' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                              {link.type}
                            </span>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 truncate"
                              title={link.url}
                            >
                              {link.url.length > 30 ? link.url.substring(0, 30) + '...' : link.url}
                            </a>
                          </div>
                        ))}
                        {candidate.task_submission.links.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{candidate.task_submission.links.length - 2} more links
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {candidate.task_submission?.submitted_at && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Submitted:</span>{' '}
                      {new Date(candidate.task_submission.submitted_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className="w-full btn btn-primary"
                >
                  Evaluate Task
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates to evaluate</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter || jobFilter || submitDateFilter
              ? 'No candidates match your current filters.'
              : 'All candidates have been evaluated or no tasks have been submitted yet.'}
          </p>
        </div>
      )}

      

      {/* Evaluation Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEvaluate}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Evaluate {selectedCandidate.name}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Score (0-100)
                          </label>
                          <div className="mt-1 flex items-center">
                            {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setScore(value.toString())}
                                className={`mr-2 p-2 rounded-lg border ${score === value.toString()
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-300 hover:border-gray-400'
                                  }`}
                              >
                                <StarIcon className={`h-5 w-5 ${score === value.toString() ? 'text-primary-600' : 'text-gray-400'
                                  }`} />
                                <span className="ml-1 text-sm">{value}</span>
                              </button>
                            ))}
                          </div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="mt-2 input"
                            placeholder="Enter score (0-100)"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Comments
                          </label>
                          <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={4}
                            className="mt-1 input"
                            placeholder="Provide feedback on the task submission..."
                          />
                        </div>

                        {selectedCandidate.task_submission?.links && selectedCandidate.task_submission.links.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Task Submission Links
                            </label>
                            <div className="mt-2 space-y-2">
                              {selectedCandidate.task_submission.links.map((link, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${link.type === 'github' ? 'bg-gray-100 text-gray-800' :
                                      link.type === 'live' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                      {link.type}
                                    </span>
                                  </div>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 break-all"
                                  >
                                    {link.url}
                                  </a>
                                </div>
                              ))}
                            </div>
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
                    Submit Evaluation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCandidate(null);
                      setScore('');
                      setComments('');
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

export default Evaluation;
