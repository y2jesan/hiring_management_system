import {
  DocumentArrowDownIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';

const Candidates = () => {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [applyDateFilter, setApplyDateFilter] = useState('');
  const [submitDateFilter, setSubmitDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const jobIdFromUrl = searchParams.get('job_id');
    const statusFromUrl = searchParams.get('status');

    if (jobIdFromUrl) {
      setJobFilter(jobIdFromUrl);
    }
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }

    // Show filters if there are any active filters from URL
    if (jobIdFromUrl || statusFromUrl) {
      setShowFilters(true);
    }

    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesResponse, jobsResponse] = await Promise.all([
        candidateService.getAllCandidates(),
        jobService.getAllJobs({ is_active: true })
      ]);
      setCandidates(candidatesResponse.data?.candidates || candidatesResponse.data || []);
      setJobs(jobsResponse.data?.jobs || jobsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view candidates');
      } else {
        toast.error('Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (jobFilter) params.job_id = jobFilter;
      if (statusFilter) params.status = statusFilter;
      if (applyDateFilter) params.apply_date = applyDateFilter;
      if (submitDateFilter) params.submit_date = submitDateFilter;

      const blob = await candidateService.exportCandidates(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'candidates.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Candidates exported successfully');
    } catch (error) {
      console.error('Error exporting candidates:', error);
      toast.error('Failed to export candidates');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Applied': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'Task Pending': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      'Task Submitted': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      'Under Review': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      'Interview Eligible': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'Interview Scheduled': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
      'Interview Completed': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      'Shortlisted': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
      'Selected': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'Rejected': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
        {status}
      </span>
    );
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.application_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || candidate.status === statusFilter;

    const matchesJob = !jobFilter || candidate.job_id?.job_id === jobFilter;

    const matchesApplyDate = !applyDateFilter ||
      new Date(candidate.createdAt).toDateString() === new Date(applyDateFilter).toDateString();

    const matchesSubmitDate = !submitDateFilter ||
      (candidate.task_submission?.submitted_at &&
        new Date(candidate.task_submission.submitted_at).toDateString() === new Date(submitDateFilter).toDateString());

    return matchesSearch && matchesStatus && matchesJob && matchesApplyDate && matchesSubmitDate;
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
          <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Candidates</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
            Manage candidate applications and track their progress
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn btn-secondary flex items-center"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or application ID..."
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
                {(statusFilter || jobFilter || applyDateFilter || submitDateFilter) && (
                  <span className="ml-2 bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                    {[statusFilter, jobFilter, applyDateFilter, submitDateFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input"
                  >
                    <option value="">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Task Pending">Task Pending</option>
                    <option value="Task Submitted">Task Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Interview Eligible">Interview Eligible</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Interview Completed">Interview Completed</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
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
                    Apply Date
                  </label>
                  <input
                    type="date"
                    value={applyDateFilter}
                    onChange={(e) => setApplyDateFilter(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Applications</dt>
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
                <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Selected</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {candidates.filter(c => c.status === 'Selected').length}
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
                <div className="h-8 w-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Review</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {candidates.filter(c => ['Task Submitted', 'Under Review'].includes(c.status)).length}
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
                  <span className="text-white text-sm font-medium">R</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {candidates.filter(c => c.status === 'Rejected').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                    Score
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Task Links
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCandidates.map((candidate,i) => (
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
                            <Link to={`/admin/candidates/${candidate._id}`} className="hover:underline">{candidate.name}</Link>
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
                      <Link to={`/application/${candidate.application_id}`} className="hover:underline">{candidate.application_id}</Link>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>
                        <div className="font-medium">
                          {candidate.job_id?.title ? (
                            <Link to={`/admin/jobs/${candidate.job_id?.job_id}`} className="hover:underline">{candidate.job_id.title}</Link>
                          ) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {candidate.job_id?.experience_in_year || 'N/A'} experience
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {getStatusBadge(candidate.status)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {candidate.evaluation?.score ? `${candidate.evaluation.score}%` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {candidate.task_submission?.links && candidate.task_submission.links.length > 0 ? (
                        <div className="space-y-1">
                          {candidate.task_submission.links.slice(0, 2).map((link, index) => (
                            <div key={index} className="flex items-center space-x-1">
                              {/* <LinkIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" /> */}
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${link.type === 'github' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                                  link.type === 'live' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                    'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                }`}>
                                {link.type}
                              </span>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs truncate max-w-20"
                                title={link.url}
                              >
                                {link.url.length > 20 ? link.url.substring(0, 20) + '...' : link.url}
                              </a>
                            </div>
                          ))}
                          {candidate.task_submission.links.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              +{candidate.task_submission.links.length - 2} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No links</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/admin/candidates/${candidate._id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        {/* <button
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button> */}
                      </div>
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
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No candidates found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Get started by creating a job posting.'}
              </p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default Candidates;
