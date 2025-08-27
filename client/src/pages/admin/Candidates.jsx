import {
  DocumentArrowDownIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import { candidateService } from '../../services/candidateService';
import { experienceService } from '../../services/experienceService';
import { jobService } from '../../services/jobService';
import { userService } from '../../services/userService';

const Candidates = () => {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [applyDateFilter, setApplyDateFilter] = useState('');
  const [submitDateFilter, setSubmitDateFilter] = useState('');

  const [salaryFilter, setSalaryFilter] = useState('');
  const [experienceFilterIds, setExperienceFilterIds] = useState([]);
  const [yearsOfExperienceFilter, setYearsOfExperienceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    reference: '',
    job_id: '',
    years_of_experience: '',
    expected_salary: '',
    notice_period_in_months: '',
    core_experience: []
  });
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
      const [candidatesResponse, jobsResponse, usersResponse, experiencesResponse] = await Promise.all([
        candidateService.getAllCandidates(),
        jobService.getAllJobs({ is_active: true }),
        userService.getAllUsers({ is_active: true }),
        experienceService.getAllExperiences({ active: true })
      ]);
      setCandidates(candidatesResponse.data?.candidates || candidatesResponse.data || []);
      setJobs(jobsResponse.data?.jobs || jobsResponse.data || []);
      setUsers(usersResponse.data?.users || usersResponse.data || []);
      setExperiences(experiencesResponse.data?.experiences || experiencesResponse.experiences || []);
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
      if (yearsOfExperienceFilter) params.min_experience = yearsOfExperienceFilter;
      if (salaryFilter) params.min_salary = salaryFilter;

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

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    setEditFormData({
      name: candidate.name || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      status: candidate.status || '',
      reference: candidate.reference?._id || '',
      job_id: candidate.job_id?._id || '',
      years_of_experience: candidate.years_of_experience || '',
      expected_salary: candidate.expected_salary || '',
      notice_period_in_months: candidate.notice_period_in_months || '',
      core_experience: candidate.core_experience ? candidate.core_experience.map(exp => exp._id || exp) : []
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingCandidate) return;

    try {
      setSubmitting(true);
      await candidateService.updateCandidate(editingCandidate._id, editFormData);
      toast.success('Candidate updated successfully');
      setShowEditModal(false);
      setEditingCandidate(null);
      setEditFormData({
        name: '',
        email: '',
        phone: '',
        status: '',
        reference: '',
        job_id: '',
        years_of_experience: '',
        expected_salary: '',
        notice_period_in_months: '',
        core_experience: []
      });
      fetchData();
    } catch (error) {
      console.error('Error updating candidate:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update candidate');
      }
    } finally {
      setSubmitting(false);
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
      candidate.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.core_experience && candidate.core_experience.some(exp =>
        exp.name && exp.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesStatus = !statusFilter || candidate.status === statusFilter;

    const matchesJob = !jobFilter || candidate.job_id?.job_id === jobFilter;

    const matchesApplyDate = !applyDateFilter ||
      new Date(candidate.createdAt).toDateString() === new Date(applyDateFilter).toDateString();

    const matchesSubmitDate = !submitDateFilter ||
      (candidate.task_submission?.submitted_at &&
        new Date(candidate.task_submission.submitted_at).toDateString() === new Date(submitDateFilter).toDateString());

    const matchesExperience = !experienceFilterIds.length ||
      (candidate.core_experience && candidate.core_experience.some(exp =>
        experienceFilterIds.includes(exp._id)
      ));

    const matchesYearsOfExperience = !yearsOfExperienceFilter ||
      (candidate.years_of_experience && candidate.years_of_experience >= parseFloat(yearsOfExperienceFilter));

    const matchesSalary = !salaryFilter ||
      (candidate.expected_salary && candidate.expected_salary >= parseFloat(salaryFilter));

    return matchesSearch && matchesStatus && matchesJob && matchesApplyDate && matchesSubmitDate && matchesExperience && matchesYearsOfExperience && matchesSalary;
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
                {(statusFilter || jobFilter || applyDateFilter || submitDateFilter || experienceFilterIds.length > 0 || yearsOfExperienceFilter || salaryFilter) && (
                  <span className="ml-2 bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                    {[statusFilter, jobFilter, applyDateFilter, submitDateFilter, experienceFilterIds.length > 0 ? 'exp' : '', yearsOfExperienceFilter, salaryFilter].filter(Boolean).length}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Core Experience
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {experiences.map((experience) => (
                      <label key={experience._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={experienceFilterIds.includes(experience._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExperienceFilterIds([...experienceFilterIds, experience._id]);
                            } else {
                              setExperienceFilterIds(experienceFilterIds.filter(id => id !== experience._id));
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{experience.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Years of Experience
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={yearsOfExperienceFilter}
                    onChange={(e) => setYearsOfExperienceFilter(e.target.value)}
                    className="input"
                    placeholder="e.g., 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Expected Salary (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salaryFilter}
                    onChange={(e) => setSalaryFilter(e.target.value)}
                    className="input"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
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

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">E</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg Experience</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {candidates.length > 0
                      ? (candidates.reduce((sum, c) => sum + (c.years_of_experience || 0), 0) / candidates.length).toFixed(1)
                      : '0'
                    } years
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
                <div className="h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg Expected Salary</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {candidates.length > 0
                      ? `BDT ${(candidates.reduce((sum, c) => sum + (c.expected_salary || 0), 0) / candidates.length).toLocaleString()}`
                      : 'BDT 0'
                    }
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
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Years of Experience
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Core Experience
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expected Salary
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
                {filteredCandidates.map((candidate, i) => (
                  <tr key={candidate._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap text-center">
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
                          <Link to={`/application/${candidate.application_id}`} className="hover:underline">{candidate.application_id}</Link>
                        </div>
                      </div>
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
                      {candidate.years_of_experience ? `${candidate.years_of_experience} years` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {candidate.core_experience && candidate.core_experience.length > 0 ? (
                        <div className="space-y-1">
                          {candidate.core_experience.slice(0, 2).map((exp, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {exp.name}
                            </span>
                          ))}
                          {candidate.core_experience.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{candidate.core_experience.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {candidate.expected_salary ? `BDT ${candidate.expected_salary.toLocaleString()}` : 'N/A'}
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
                        <button
                          onClick={() => handleEdit(candidate)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {/* <button
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

      {/* Edit Candidate Modal */}
      {showEditModal && editingCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitEdit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                        Edit Candidate - {editingCandidate.name}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone *
                          </label>
                          <input
                            type="text"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status *
                          </label>
                          <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            className="mt-1 input"
                            required
                          >
                            <option value="">Select Status</option>
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Job *
                          </label>
                          <select
                            value={editFormData.job_id}
                            onChange={(e) => setEditFormData({ ...editFormData, job_id: e.target.value })}
                            className="mt-1 input"
                            required
                          >
                            <option value="">Select Job</option>
                            {jobs.map((job) => (
                              <option key={job._id} value={job._id}>
                                {job.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reference
                          </label>
                          <select
                            value={editFormData.reference}
                            onChange={(e) => setEditFormData({ ...editFormData, reference: e.target.value })}
                            className="mt-1 input"
                          >
                            <option value="">No Reference</option>
                            {users.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.name} - {user.email}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Years of Experience *
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={editFormData.years_of_experience}
                            onChange={(e) => setEditFormData({ ...editFormData, years_of_experience: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Expected Salary (BDT) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editFormData.expected_salary}
                            onChange={(e) => setEditFormData({ ...editFormData, expected_salary: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notice Period (Months) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editFormData.notice_period_in_months}
                            onChange={(e) => setEditFormData({ ...editFormData, notice_period_in_months: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Core Experience
                          </label>
                          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                            {experiences.map((experience) => (
                              <label key={experience._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={editFormData.core_experience.includes(experience._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditFormData({
                                        ...editFormData,
                                        core_experience: [...editFormData.core_experience, experience._id]
                                      });
                                    } else {
                                      setEditFormData({
                                        ...editFormData,
                                        core_experience: editFormData.core_experience.filter(id => id !== experience._id)
                                      });
                                    }
                                  }}
                                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{experience.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
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
                    {submitting ? 'Updating...' : 'Update Candidate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCandidate(null);
                      setEditFormData({
                        name: '',
                        email: '',
                        phone: '',
                        status: '',
                        reference: '',
                        job_id: ''
                      });
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

export default Candidates;
