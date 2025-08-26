import {
    BriefcaseIcon,
    DocumentIcon,
    EnvelopeIcon,
    PhoneIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';

const JobApplication = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCV, setSelectedCV] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    const fetchJob = async () => {
        try {
            setLoading(true);
            const response = await jobService.getJobByJobId(jobId);
            const jobData = response.data?.job || response.data;
            setJob(jobData);
        } catch (error) {
            console.error('Error fetching job:', error);
            toast.error('Job not found or no longer available');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        if (!selectedCV) {
            toast.error('Please upload your CV');
            return;
        }

        try {
            setSubmitting(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('cv', selectedCV);
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('phone', data.phone);

            // Debug: Log FormData contents
            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            await candidateService.createCandidate(job.job_id, formData);

            toast.success('Application submitted successfully! Check your email for further instructions.');

            // Reset form
            setSelectedCV(null);
            document.getElementById('application-form').reset();

        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error('Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCVChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('CV file size must be less than 5MB');
                return;
            }
            setSelectedCV(file);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
                    <p className="text-gray-600">The job you're looking for is no longer available.</p>
                    <p className="text-sm text-gray-500 mt-2">Job ID: {jobId}</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
                        <BriefcaseIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Application</h1>
                    <p className="text-lg text-gray-600">Apply for the position below</p>
                </div>

                {/* Job Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-start space-x-4">
                        {job.image && (
                            <img
                                src={job.image}
                                alt={job.title}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                            <p className="text-lg text-gray-600 mb-4">{job.designation}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Experience:</span> {job.experience_in_year || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-medium">Salary Range:</span> {job.salary_range}
                                </div>
                                <div>
                                    <span className="font-medium">Job ID:</span> {job.job_id}
                                </div>
                                <div>
                                    <span className="font-medium">Status:</span>{' '}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {job.is_active ? 'Active' : 'Closed'}
                                    </span>
                                </div>
                            </div>

                            {/* Job Description */}
                            {job.job_description && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                                    <div className="prose prose-sm max-w-none text-gray-700">
                                        <div
                                            className="markdown-content"
                                            dangerouslySetInnerHTML={{
                                                __html: job.job_description
                                                    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
                                                    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>')
                                                    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>')
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                                                    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                                                    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
                                                    .replace(/\n\n/g, '</p><p class="mb-3">')
                                                    .replace(/^(.+)$/gm, '<p class="mb-3">$1</p>')
                                                    .replace(/<p class="mb-3"><\/p>/g, '')
                                                    .replace(/<p class="mb-3"><h[1-6]/g, '<h')
                                                    .replace(/<\/h[1-6]><\/p>/g, '</h>')
                                                    .replace(/<p class="mb-3"><li/g, '<ul class="list-disc ml-6 mb-3"><li')
                                                    .replace(/<\/li><\/p>/g, '</li></ul>')
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Application Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Form</h3>

                    <form id="application-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <UserIcon className="h-4 w-4 inline mr-1" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    className={`input ${errors.name ? 'border-danger-500' : ''}`}
                                    placeholder="Enter your full name"
                                    {...register('name', {
                                        required: 'Full name is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                    })}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className={`input ${errors.email ? 'border-danger-500' : ''}`}
                                    placeholder="Enter your email address"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <PhoneIcon className="h-4 w-4 inline mr-1" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                className={`input ${errors.phone ? 'border-danger-500' : ''}`}
                                placeholder="01XXXXXXXXX (11 digits starting with 01)"
                                {...register('phone', {
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^01\d{9}$/,
                                        message: 'Phone number must be 11 digits starting with 01'
                                    },
                                    minLength: {
                                        value: 11,
                                        message: 'Phone number must be exactly 11 digits'
                                    },
                                    maxLength: {
                                        value: 11,
                                        message: 'Phone number must be exactly 11 digits'
                                    }
                                })}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-danger-600">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DocumentIcon className="h-4 w-4 inline mr-1" />
                                CV/Resume (PDF, DOC, DOCX)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleCVChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                required
                            />
                            {selectedCV && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Selected file: {selectedCV.name}
                                </p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                Maximum file size: 5MB. Accepted formats: PDF, DOC, DOCX
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• You'll receive a confirmation email with your Application ID</li>
                                <li>• We'll review your application and send you a task assignment</li>
                                <li>• Complete the task and submit it through your candidate portal</li>
                                <li>• We'll evaluate your submission and contact you for next steps</li>
                            </ul>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !job.is_active}
                                className="btn btn-primary px-8 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </div>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JobApplication;
