import {
    BriefcaseIcon,
    DocumentTextIcon,
    PencilIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { FolderPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import { jobService } from '../../services/jobService';

const Jobs = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [statusFilter, setStatusFilter] = useState('active');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        fetchJobs();
        
        // Check if create parameter is present in URL
        const createParam = searchParams.get('create');
        if (createParam === 'true') {
            setShowModal(true);
            setEditingJob(null);
            reset();
            // Clear the create parameter from URL to prevent reopening on refresh
            navigate('/admin/jobs', { replace: true });
        }
    }, [searchParams]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await jobService.getAllJobs();
            setJobs(response.data?.jobs || response.data || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            if (error.response?.status === 401) {
                toast.error('Please log in to view jobs');
            } else {
                toast.error('Failed to fetch jobs');
            }
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingJob) {
                await jobService.updateJob(editingJob._id, data);
                toast.success('Job updated successfully');
            } else {
                await jobService.createJob(data);
                toast.success('Job created successfully');
            }

            setShowModal(false);
            setEditingJob(null);
            reset();
            fetchJobs();
        } catch (error) {
            console.error('Error saving job:', error);
            toast.error('Failed to save job');
        }
    };

    const handleEdit = (job) => {
        setEditingJob(job);
        reset(job);
        setShowModal(true);
    };

    const handleToggleStatus = async (jobId, currentStatus) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'activate' : 'deactivate';
        
        if (window.confirm(`Are you sure you want to ${action} this job? ${!newStatus ? 'Applications will no longer be accepted for this job.' : ''}`)) {
            try {
                await jobService.toggleJobStatus(jobId);
                toast.success(`Job ${action}d successfully`);
                fetchJobs();
            } catch (error) {
                console.error(`Error ${action}ing job:`, error);
                toast.error(`Failed to ${action} job`);
            }
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return job.is_active;
        if (statusFilter === 'inactive') return !job.is_active;
        return true;
    });

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Active
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                Inactive
            </span>
        );
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-primary-800">Jobs</h1>
                    <p className="mt-1 text-sm text-gray-500 hidden lg:block">
                        Manage job postings and applications
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input h-10"
                    >
                        <option value="all">All Jobs</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        onClick={() => {
                            setEditingJob(null);
                            reset();
                            setShowModal(true);
                        }}
                        className="btn btn-primary flex items-center h-12 w-12 lg:h-10 lg:w-auto lg:px-4 flex-shrink-0 justify-center lg:justify-start"
                    >
                        <FolderPlus className="h-6 w-6 lg:h-5 lg:w-5 lg:mr-2" />
                        <span className="hidden lg:inline">Create Job</span>
                    </button>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                    <div key={job._id} className="card">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <BriefcaseIcon className="h-8 w-8 text-primary-600 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {job.job_id}</p>
                                    </div>
                                </div>
                                {getStatusBadge(job.is_active)}
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Designation:</span> {job.designation}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Experience:</span> {job.experience_in_year || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Salary:</span> {job.salary_range}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex space-x-2">
                                    <a
                                        href={`/job-application/${job.job_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary flex items-center text-sm h-8 px-3"
                                    >
                                        <DocumentTextIcon className="h-4 w-4 mr-1 lg:mr-1" />
                                        <span className="hidden lg:inline">Application</span>
                                    </a>
                                    <button
                                        onClick={() => navigate(`/admin/candidates?job_id=${job.job_id}`)}
                                        className="btn btn-primary flex items-center text-sm h-8 px-3"
                                    >
                                        <UsersIcon className="h-4 w-4 mr-1 lg:mr-1" />
                                        <span className="hidden lg:inline">Candidates</span>
                                    </button>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(job)}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                        title="Edit Job"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const applicationUrl = `${window.location.origin}/job-application/${job.job_id}`;
                                            navigator.clipboard.writeText(applicationUrl);
                                            toast.success('Application link copied to clipboard!');
                                        }}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                        title="Copy Application Link"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(job._id, job.is_active)}
                                        className={`p-1 ${job.is_active ? 'text-green-600 hover:text-red-600' : 'text-red-600 hover:text-green-600'}`}
                                        title={job.is_active ? 'Deactivate Job' : 'Activate Job'}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 ${job.is_active ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'}`}>
                                            <div className={`w-1 h-1 rounded-full bg-white mx-auto mt-1 ${job.is_active ? 'ml-1' : 'mr-1'}`}></div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredJobs.length === 0 && (
                <div className="text-center py-12">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        {jobs.length === 0 ? 'No jobs' : 'No jobs match the selected filter'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {jobs.length === 0 ? 'Get started by creating a new job posting.' : 'Try adjusting your filter criteria.'}
                    </p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-primary-800 dark:text-primary-200 mb-4">
                                                {editingJob ? 'Edit Job' : 'Create New Job'}
                                            </h3>
                                            {!editingJob && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                    Fill in the details below to create a new job posting.
                                                </p>
                                            )}

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Job Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`mt-1 input ${errors.title ? 'border-danger-500' : ''}`}
                                                        {...register('title', { required: 'Job title is required' })}
                                                    />
                                                    {errors.title && (
                                                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.title.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Designation
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`mt-1 input ${errors.designation ? 'border-danger-500' : ''}`}
                                                        {...register('designation', { required: 'Designation is required' })}
                                                    />
                                                    {errors.designation && (
                                                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.designation.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Job Description (Markdown)
                                                    </label>
                                                    <textarea
                                                        rows="12"
                                                        className={`mt-1 input ${errors.job_description ? 'border-danger-500' : ''}`}
                                                        placeholder="Enter job description in markdown format..."
                                                        {...register('job_description', {
                                                            required: 'Job description is required',
                                                            minLength: { value: 10, message: 'Job description must be at least 10 characters' }
                                                        })}
                                                    />
                                                    {errors.job_description && (
                                                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.job_description.message}</p>
                                                    )}
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Supports markdown formatting (headings, lists, bold, italic, etc.)
                                                    </p>
                                                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Markdown Formatting Guide:</p>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                            <div><strong>Headings:</strong> # Main Title, ## Section, ### Subsection</div>
                                                            <div><strong>Bold:</strong> **text** or __text__</div>
                                                            <div><strong>Italic:</strong> *text* or _text_</div>
                                                            <div><strong>Lists:</strong> - item or * item or 1. item</div>
                                                            <div><strong>Links:</strong> [text](url)</div>
                                                            <div><strong>Code:</strong> `code` or ```code block```</div>
                                                            <div><strong>Line breaks:</strong> Add two spaces at end of line</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Salary Range
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`mt-1 input ${errors.salary_range ? 'border-danger-500' : ''}`}
                                                        placeholder="e.g., $50,000 - $70,000"
                                                        {...register('salary_range', { required: 'Salary range is required' })}
                                                    />
                                                    {errors.salary_range && (
                                                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.salary_range.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Experience
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`mt-1 input ${errors.experience_in_year ? 'border-danger-500' : ''}`}
                                                        placeholder="e.g., 3+ years, Entry level, etc."
                                                        {...register('experience_in_year')}
                                                    />
                                                    {errors.experience_in_year && (
                                                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.experience_in_year.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Task Link (Optional)
                                                    </label>
                                                    <input
                                                        type="url"
                                                        className="mt-1 input"
                                                        placeholder="https://github.com/..."
                                                        {...register('task_link')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-primary-50 dark:bg-primary-900 px-4 py-3 sm:px-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingJob(null);
                                            reset();
                                        }}
                                        className="btn btn-secondary sm:mt-0 sm:w-auto mr-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary sm:w-auto"
                                    >
                                        {editingJob ? 'Update' : 'Create'}
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

export default Jobs;
