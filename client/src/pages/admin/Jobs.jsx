import {
    BriefcaseIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { jobService } from '../../services/jobService';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        fetchJobs();
    }, []);

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

    const handleDelete = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                await jobService.deleteJob(jobId);
                toast.success('Job deleted successfully');
                fetchJobs();
            } catch (error) {
                console.error('Error deleting job:', error);
                toast.error('Failed to delete job');
            }
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Inactive
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
                    <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage job postings and applications
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingJob(null);
                        reset();
                        setShowModal(true);
                    }}
                    className="btn btn-primary flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Job
                </button>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                    <div key={job._id} className="card">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <BriefcaseIcon className="h-8 w-8 text-primary-600 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                        <p className="text-sm text-gray-500">ID: {job.job_id}</p>
                                    </div>
                                </div>
                                {getStatusBadge(job.is_active)}
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Designation:</span> {job.designation}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Experience:</span> {job.experience_in_year || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Salary:</span> {job.salary_range}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <a
                                    href={`/job-application/${job.job_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    View Application Form
                                </a>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(job)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(job._id)}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {jobs.length === 0 && (
                <div className="text-center py-12">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new job posting.
                    </p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                {editingJob ? 'Edit Job' : 'Create New Job'}
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Job Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`mt-1 input ${errors.title ? 'border-danger-500' : ''}`}
                                                        {...register('title', { required: 'Job title is required' })}
                                                    />
                                                    {errors.title && (
                                                        <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Designation
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`mt-1 input ${errors.designation ? 'border-danger-500' : ''}`}
                                                        {...register('designation', { required: 'Designation is required' })}
                                                    />
                                                    {errors.designation && (
                                                        <p className="mt-1 text-sm text-danger-600">{errors.designation.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
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
                                                        <p className="mt-1 text-sm text-danger-600">{errors.job_description.message}</p>
                                                    )}
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Supports markdown formatting (headings, lists, bold, italic, etc.)
                                                    </p>
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                                        <p className="text-xs font-medium text-gray-700 mb-2">Markdown Formatting Guide:</p>
                                                        <div className="text-xs text-gray-600 space-y-1">
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
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Salary Range
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`mt-1 input ${errors.salary_range ? 'border-danger-500' : ''}`}
                                                        placeholder="e.g., $50,000 - $70,000"
                                                        {...register('salary_range', { required: 'Salary range is required' })}
                                                    />
                                                    {errors.salary_range && (
                                                        <p className="mt-1 text-sm text-danger-600">{errors.salary_range.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Experience
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`mt-1 input ${errors.experience_in_year ? 'border-danger-500' : ''}`}
                                                        placeholder="e.g., 3+ years, Entry level, etc."
                                                        {...register('experience_in_year')}
                                                    />
                                                    {errors.experience_in_year && (
                                                        <p className="mt-1 text-sm text-danger-600">{errors.experience_in_year.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
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

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="btn btn-primary sm:ml-3 sm:w-auto"
                                    >
                                        {editingJob ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingJob(null);
                                            reset();
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

export default Jobs;
