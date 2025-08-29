import {
    BriefcaseIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import qtecLogo from '../../assets/qtec_icon.svg';
import Loader from '../../components/Loader';
import { jobService } from '../../services/jobService';

const AllJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveJobs();
    }, []);

    const fetchActiveJobs = async () => {
        try {
            setLoading(true);
            const response = await jobService.getActiveJobs();
            setJobs(response.data?.jobs || response.data || []);
        } catch (error) {
            console.error('Error fetching active jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (jobId) => {
        navigate(`/job-application/${jobId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 !bg-gray-50 candidate-page">
                <Loader size="md" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 !bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 all-jobs-page candidate-page" style={{ colorScheme: 'light' }}>
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <img src={qtecLogo} alt="QTEC Logo" className="h-12 w-12 mr-4" />
                        {/* <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                            <UserIcon className="h-8 w-8 text-white" />
                        </div> */}
                    </div>
                    <h1 className="text-4xl font-bold text-primary-800 mb-4">
                        Join Our Team
                    </h1>
                    <p className="text-xl text-gray-600 !text-gray-600 max-w-3xl mx-auto">
                        Discover exciting opportunities and become part of our dynamic team.
                        We're looking for talented individuals who are passionate about innovation and growth.
                    </p>
                    <p className="text-lg text-gray-500 !text-gray-500 mt-4">
                        Browse our current openings and find the perfect role for your career.
                    </p>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <div key={job._id} className="bg-white !bg-white rounded-lg shadow-sm border border-gray-200 !border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <BriefcaseIcon className="h-8 w-8 text-primary-600 mr-3" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 !text-gray-900">{job.title}</h3>
                                            <p className="text-sm text-gray-500 !text-gray-500">{job.designation}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-sm text-gray-600 !text-gray-600">
                                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                        <span className="font-medium">Experience:</span>
                                        <span className="ml-1">{job.experience_in_year || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 !text-gray-600">
                                        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                        <span className="font-medium">Salary:</span>
                                        <span className="ml-1">{job.salary_range}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 !text-gray-600">
                                        <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                                        <span className="font-medium">Job ID:</span>
                                        <span className="ml-1">{job.job_id}</span>
                                    </div>
                                </div>

                                {/* Job Description Preview */}
                                {job.job_description && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 !text-gray-700 mb-2">Job Description</h4>
                                        <div className="text-sm text-gray-600 !text-gray-600 line-clamp-3">
                                            {job.job_description.replace(/[#*`]/g, '').substring(0, 150)}...
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => handleApply(job.job_id)}
                                        className="w-full btn btn-primary flex items-center justify-center"
                                    >
                                        <BriefcaseIcon className="h-4 w-4 mr-2" />
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {jobs.length === 0 && (
                    <div className="text-center py-12">
                        <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 !text-gray-900">
                            No active positions available
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 !text-gray-500">
                            We don't have any open positions at the moment. Please check back later!
                        </p>
                    </div>
                )}

                {/* Call to Action */}
                {jobs.length > 0 && (
                    <div className="mt-12 text-center">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Not Ready to Join Us Now?
                            </h2>
                            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                Even if there’s no open role that matches you right now, you can share your details with us. We’ll keep your profile in our Talent Pool and reach out when an opportunity that fits your skills comes up.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/talent-pool"
                                    className="btn btn-primary"
                                >
                                    Join Our Talent Pool
                                </Link>
                                <a
                                    href="mailto:careers@qtec.com"
                                    className="btn btn-secondary"
                                >
                                    Contact HR
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllJobs;
