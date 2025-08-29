import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import qtecLogo from '../../assets/qtec_icon.svg';
import Loader from '../../components/Loader';
import { candidateService } from '../../services/candidateService';

const CandidatePortal = () => {
  const { applicationId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [links, setLinks] = useState([{ url: '', type: 'other' }]);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const {
    handleSubmit,
  } = useForm();

  useEffect(() => {
    fetchCandidate();
  }, [applicationId]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const response = await candidateService.getCandidateByApplicationId(applicationId);
      setCandidate(response.data?.candidate || response.data);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      toast.error('Application not found');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmission = async () => {
    try {
      setSubmitting(true);

      // Filter out empty links
      const validLinks = links.filter(link => link.url.trim() !== '');

      if (validLinks.length === 0) {
        toast.error('At least one link is required');
        return;
      }

      await candidateService.submitTask(applicationId, { links: validLinks });
      toast.success('Task submitted successfully!');
      setShowTaskForm(false);
      setLinks([{ url: '', type: 'other' }]);
      fetchCandidate();
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMoreLinks = async () => {
    try {
      setSubmitting(true);

      // Filter out empty links
      const validLinks = links.filter(link => link.url.trim() !== '');

      if (validLinks.length === 0) {
        toast.error('At least one link is required');
        return;
      }

      // Combine existing links with new links
      const existingLinks = candidate.task_submission.links || [];
      const allLinks = [...existingLinks, ...validLinks];

      if (allLinks.length > 10) {
        toast.error('Maximum 10 links allowed in total');
        return;
      }

      await candidateService.submitTask(applicationId, { links: allLinks });
      toast.success('Additional links added successfully!');
      setShowTaskForm(false);
      setLinks([{ url: '', type: 'other' }]);
      fetchCandidate();
    } catch (error) {
      console.error('Error adding more links:', error);
      toast.error('Failed to add more links');
    } finally {
      setSubmitting(false);
    }
  };

  const addLink = () => {
    const existingLinksCount = candidate.task_submission && candidate.task_submission.links ? candidate.task_submission.links.length : 0;
    const maxNewLinks = 10 - existingLinksCount;

    if (links.length < maxNewLinks) {
      setLinks([...links, { url: '', type: 'other' }]);
    } else {
      toast.error(`Maximum ${maxNewLinks} additional links allowed`);
    }
  };

  const removeLink = (index) => {
    // Don't allow removal if this is adding to existing submission
    if (candidate.task_submission && candidate.task_submission.links && candidate.task_submission.links.length > 0) {
      toast.error('Cannot remove links when adding to existing submission');
      return;
    }

    if (links.length > 1) {
      const newLinks = links.filter((_, i) => i !== index);
      setLinks(newLinks);
    }
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Applied': { color: 'bg-blue-100 !bg-blue-100 text-blue-800 !text-blue-800', icon: ClockIcon },
      'Task Pending': { color: 'bg-yellow-100 !bg-yellow-100 text-yellow-800 !text-yellow-800', icon: ClipboardDocumentCheckIcon },
      'Task Submitted': { color: 'bg-purple-100 !bg-purple-100 text-purple-800 !text-purple-800', icon: DocumentIcon },
      'Under Review': { color: 'bg-orange-100 !bg-orange-100 text-orange-800 !text-orange-800', icon: ClockIcon },
      'Interview Eligible': { color: 'bg-green-100 !bg-green-100 text-green-800 !text-green-800', icon: CheckCircleIcon },
      'Interview Scheduled': { color: 'bg-indigo-100 !bg-indigo-100 text-indigo-800 !text-indigo-800', icon: ClockIcon },
      'Interview Completed': { color: 'bg-gray-100 !bg-gray-100 text-gray-800 !text-gray-800', icon: CheckCircleIcon },
      'Shortlisted': { color: 'bg-pink-100 !bg-pink-100 text-pink-800 !text-pink-800', icon: CheckCircleIcon },
      'Selected': { color: 'bg-green-100 !bg-green-100 text-green-800 !text-green-800', icon: CheckCircleIcon },
      'Rejected': { color: 'bg-red-100 !bg-red-100 text-red-800 !text-red-800', icon: XCircleIcon }
    };

    const config = statusConfig[status] || statusConfig['Applied'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4 mr-2" />
        {status}
      </span>
    );
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'Applied': 'Your application has been received and is being reviewed.',
      'Task Pending': 'Your application has been approved! Please complete the assigned task.',
      'Task Submitted': 'Your task has been submitted and is under review.',
      'Under Review': 'Your task submission is being evaluated by our team.',
      'Interview Eligible': 'Congratulations! You\'ve passed the task evaluation and are eligible for an interview.',
      'Interview Scheduled': 'An interview has been scheduled. Check your email for details.',
      'Interview Completed': 'Your interview has been completed. We\'ll contact you soon.',
      'Shortlisted': 'You\'ve been shortlisted! Final decision pending.',
      'Selected': 'Congratulations! You have been selected for the position.',
      'Rejected': 'Thank you for your interest. Unfortunately, we cannot proceed with your application at this time.'
    };

    return descriptions[status] || 'Your application is being processed.';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 !bg-gray-50 candidate-page">
        <Loader size="md" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 !bg-gray-50 candidate-page">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 !text-gray-900 mb-4">Application Not Found</h1>
          <p className="text-gray-600 !text-gray-600">The application you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 !bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 candidate-portal-page candidate-page" style={{ colorScheme: 'light' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={qtecLogo} alt="QTEC Logo" className="h-12 w-12 mr-4" />
            {/* <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div> */}
          </div>
          <h1 className="text-3xl font-bold text-primary-800 !text-primary-800 mb-2">QTEC Candidate Portal</h1>
          <p className="text-lg text-gray-600 !text-gray-600">Track your application progress</p>
        </div>

        {/* Application Status */}
        <div className="bg-white !bg-white rounded-lg shadow-sm border border-gray-200 !border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 !text-gray-900">{candidate.name}</h2>
              <p className="text-gray-600 !text-gray-600">{candidate.job_id?.title}</p>
            </div>
            {getStatusBadge(candidate.status)}
          </div>

          <div className="bg-blue-50 !bg-blue-50 border border-blue-200 !border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 !text-blue-800">{getStatusDescription(candidate.status)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 !text-gray-900 mb-4">Application Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Application ID:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.application_id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Email:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Phone:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Years of Experience:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.years_of_experience || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Expected Salary:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.expected_salary ? `BDT ${candidate.expected_salary.toLocaleString()}` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Notice Period:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.notice_period_in_months ? `${candidate.notice_period_in_months} month(s)` : 'N/A'}</p>
                </div>

              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 !text-gray-900 mb-4">Job Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Position:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.job_id?.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Designation:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.job_id?.designation}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Experience Required:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.job_id?.experience_in_year} years</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Salary Range:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.job_id?.salary_range}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Core Experience:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {candidate.core_experience && candidate.core_experience.length > 0 ? (
                      candidate.core_experience.map((exp) => (
                        <span key={exp._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium !bg-primary-500 !text-white">
                          {exp.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400 !text-gray-400">No core experience listed</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Applied Date:</span>
                  <p className="text-gray-900 !text-gray-900">{new Date(candidate.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Section - Collapsible */}
        <div className="bg-white !bg-white rounded-lg shadow-sm border border-gray-200 !border-gray-200 p-6 mb-8">
          <button
            onClick={() => setShowJobDetails(!showJobDetails)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <DocumentIcon className="h-6 w-6 text-primary-600 !text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 !text-gray-900">Job Description</h3>
            </div>
            {showJobDetails ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500 !text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500 !text-gray-500" />
            )}
          </button>

          {showJobDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200 !border-gray-200">
              <div className="prose max-w-none">
                <h4 className="text-md font-medium text-gray-900 !text-gray-900 mb-3">Job Description</h4>
                <div className="text-gray-700 !text-gray-700 whitespace-pre-wrap">
                  {candidate.job_id?.job_description || 'No job description available.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task Section */}
        {(['Applied', 'Task Pending'].includes(candidate.status)) && candidate.job_id?.task_link && (
          <div className="bg-white !bg-white rounded-lg shadow-sm border border-gray-200 !border-gray-200 p-6 mb-8">
            <div className="flex items-center mb-4">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-primary-600 !text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 !text-gray-900">Task Assignment</h3>
            </div>

            <div className="bg-yellow-50 !bg-yellow-50 border border-yellow-200 !border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-yellow-900 !text-yellow-900 mb-2">Task Instructions</h4>
              <p className="text-yellow-800 !text-yellow-800 mb-3">
                Please complete the assigned task and submit your work. You can find the task details below.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={candidate.job_id.task_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center !text-primary-600 hover:!text-primary-700 font-medium"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  View Task Details
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowTaskForm(true)}
              className="btn btn-primary"
            >
              Submit Task
            </button>
          </div>
        )}

        {/* Task Submission Status */}
        {candidate.task_submission && candidate.task_submission.links && candidate.task_submission.links.length > 0 && (
          <div className="bg-white !bg-white rounded-lg shadow-sm border border-gray-200 !border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DocumentIcon className="h-6 w-6 text-primary-600 !text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 !text-gray-900 mr-3">Task Submission</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={candidate.job_id.task_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center !text-primary-600 hover:!text-primary-700 font-medium"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    View Task Details
                  </a>
                </div>
              </div>
              {(['Task Submitted', 'Under Review'].includes(candidate.status)) && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="btn btn-secondary text-sm"
                >
                  Add More Links
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500 !text-gray-500">Submitted Links:</span>
                <div className="mt-2 space-y-2">
                  {candidate.task_submission.links.map((link, index) => (
                    <div key={index} className="bg-gray-50 !bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${link.type === 'github' ? 'bg-gray-100 !bg-gray-100 text-gray-800 !text-gray-800' :
                              link.type === 'live' ? 'bg-green-100 !bg-green-100 text-green-800 !text-green-800' :
                                'bg-blue-100 !bg-blue-100 text-blue-800 !text-blue-800'
                              }`}>
                              {link.type}
                            </span>
                            <span className="text-xs text-gray-500 !text-gray-500">(Original)</span>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="!text-primary-600 hover:!text-primary-700 break-all"
                          >
                            {link.url}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {candidate.task_submission.submitted_at && (
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Submitted Date:</span>
                  <p className="text-gray-900 !text-gray-900">
                    {new Date(candidate.task_submission.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {(['Task Submitted', 'Under Review'].includes(candidate.status)) && (
                <div className="bg-blue-50 !bg-blue-50 border border-blue-200 !border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 !text-blue-800 text-sm">
                    You can add more links to your submission. Existing links cannot be removed.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evaluation Results */}
        {candidate.evaluation.score && (
          <div className="bg-white !bg-white rounded-lg shadow-sm border border-gray-200 !border-gray-200 p-6 mb-8">
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="h-6 w-6 text-primary-600 !text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 !text-gray-900">Evaluation Results</h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 !text-gray-500">Score:</span>
                <p className="text-gray-900 !text-gray-900">{candidate.evaluation.score}%</p>
              </div>
              {candidate.evaluation.comments && (
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Feedback:</span>
                  <p className="text-gray-900 !text-gray-900">{candidate.evaluation.comments}</p>
                </div>
              )}
              {candidate.evaluation.evaluated_at && (
                <div>
                  <span className="text-sm font-medium text-gray-500 !text-gray-500">Evaluated Date:</span>
                  <p className="text-gray-900 !text-gray-900">
                    {new Date(candidate.evaluation.evaluated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interview Information - supports multiple interviews */}
        {Array.isArray(candidate.interviews) && candidate.interviews.length > 0 && (
          <div className="bg-white !bg-white rounded-lg shadow-sm border border-gray-200 !border-gray-200 p-6 mb-8">
            <div className="flex items-center mb-6">
              <ClockIcon className="h-6 w-6 text-primary-600 !text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 !text-gray-900">Interview Details</h3>
              <span className="ml-2 text-sm text-gray-500 !text-gray-500">({candidate.interviews.length} interview{candidate.interviews.length > 1 ? 's' : ''})</span>
            </div>

            <div className="space-y-6">
              {candidate.interviews.map((interview, idx) => (
                <div key={interview._id} className="bg-gray-50 !bg-gray-50 rounded-lg p-6 border border-gray-200 !border-gray-200">
                  {/* Interview Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h4 className="text-lg font-semibold text-gray-900 !text-gray-900">Interview #{idx + 1}</h4>
                      {interview.result && ['Selected', 'Rejected', 'Shortlisted'].includes(candidate.status) && (
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${interview.result === 'Passed' ? 'bg-green-100 !bg-green-100 text-green-800 !text-green-800' :
                          interview.result === 'Failed' ? 'bg-red-100 !bg-red-100 text-red-800 !text-red-800' :
                            interview.result === 'No Show' ? 'bg-gray-100 !bg-gray-100 text-gray-800 !text-gray-800' :
                              interview.result === 'Taken' ? 'bg-blue-100 !bg-blue-100 text-blue-800 !text-blue-800' :
                                'bg-yellow-100 !bg-yellow-100 text-yellow-800 !text-yellow-800'
                          }`}>
                          {interview.result === 'Taken' ? 'Evaluating' : interview.result}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 !text-gray-500">
                      {new Date(interview.scheduled_date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Interview Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 !text-gray-500">Scheduled Date & Time</span>
                      <p className="text-gray-900 !text-gray-900 font-medium">
                        {new Date(interview.scheduled_date).toLocaleDateString()} at {new Date(interview.scheduled_date).toLocaleTimeString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500 !text-gray-500">Interview Type</span>
                      <p className="text-gray-900 !text-gray-900 font-medium">{interview.location}</p>
                    </div>

                    {/* {interview.interviewer && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 !text-gray-500">Interviewer</span>
                        <p className="text-gray-900 !text-gray-900 font-medium">{interview.interviewer.name}</p>
                      </div>
                    )} */}

                    {interview.completed_at && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 !text-gray-500">Completed At</span>
                        <p className="text-gray-900 !text-gray-900 font-medium">
                          {new Date(interview.completed_at).toLocaleDateString()} at {new Date(interview.completed_at).toLocaleTimeString()}
                        </p>
                      </div>
                    )}

                    {/* Interview Status Section */}
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-500 !text-gray-500">Interview Status</span>
                      <div className="mt-1">
                        {interview.result ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${interview.result === 'Pending' ? 'bg-yellow-100 !bg-yellow-100 text-yellow-800 !text-yellow-800' :
                            interview.result === 'Taken' ? 'bg-blue-100 !bg-blue-100 text-blue-800 !text-blue-800' :
                              interview.result === 'Passed' ? 'bg-green-100 !bg-green-100 text-green-800 !text-green-800' :
                                interview.result === 'Failed' ? 'bg-red-100 !bg-red-100 text-red-800 !text-red-800' :
                                  interview.result === 'No Show' ? 'bg-gray-100 !bg-gray-100 text-gray-800 !text-gray-800' :
                                    'bg-blue-100 !bg-blue-100 text-blue-800 !text-blue-800'
                            }`}>
                            {interview.result === 'Taken' ? 'Evaluating' : interview.result}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 !bg-gray-100 text-gray-800 !text-gray-800">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meeting Link Section */}
                  {interview.location === 'Online' && interview.meeting_link && (
                    <div className="mb-4 p-3 bg-blue-50 !bg-blue-50 rounded-lg border border-blue-200 !border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-blue-800 !text-blue-800">Meeting Link</span>
                          <p className="text-xs text-blue-600 !text-blue-600 mt-1">Click to join the online interview</p>
                        </div>
                        <a
                          href={interview.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-blue-600 !bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 !hover:bg-blue-700 transition-colors"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Join Meeting
                        </a>
                      </div>
                    </div>
                  )}



                  {/* Feedback Section - Only show to candidates when final decision made */}
                  {['Selected', 'Rejected', 'Shortlisted'].includes(candidate.status) && interview.feedback && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-500 !text-gray-500">Interview Feedback</span>
                      <div className="mt-2 p-3 bg-yellow-50 !bg-yellow-50 rounded-lg border border-yellow-200 !border-yellow-200">
                        <p className="text-gray-900 !text-gray-900 text-sm leading-relaxed">{interview.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Interview not completed message */}
                  {!interview.result && new Date(interview.scheduled_date) > new Date() && (
                    <div className="mt-4 p-3 bg-blue-50 !bg-blue-50 rounded-lg border border-blue-200 !border-blue-200">
                      <p className="text-blue-800 !text-blue-800 text-sm">
                        <strong>Upcoming Interview:</strong> Please be prepared and join on time.
                        {interview.location === 'Online' && ' You will receive meeting details closer to the interview time.'}
                      </p>
                    </div>
                  )}

                  {/* Interview completed but no result yet */}
                  {!interview.result && new Date(interview.scheduled_date) < new Date() && (
                    <div className="mt-4 p-3 bg-yellow-50 !bg-yellow-50 rounded-lg border border-yellow-200 !border-yellow-200">
                      <p className="text-yellow-800 !text-yellow-800 text-sm">
                        <strong>Interview Completed:</strong> Your interview has been completed and is under review.
                        You will be notified of the results soon.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Submission Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              <div className="inline-block align-bottom bg-white !bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <form onSubmit={handleSubmit(candidate.task_submission && candidate.task_submission.links && candidate.task_submission.links.length > 0 ? handleAddMoreLinks : handleTaskSubmission)}>
                  <div className="bg-white !bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 !text-gray-900 mb-4">
                          {candidate.task_submission && candidate.task_submission.links && candidate.task_submission.links.length > 0 ? 'Add More Task Links' : 'Submit Task Links'}
                        </h3>

                        <div className="space-y-4">
                          {links.map((link, index) => (
                            <div key={index} className="border border-gray-200 !border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-700 !text-gray-700">Link {index + 1}</h4>
                                {links.length > 1 && !(candidate.task_submission && candidate.task_submission.links && candidate.task_submission.links.length > 0) && (
                                  <button
                                    type="button"
                                    onClick={() => removeLink(index)}
                                    className="text-red-600 !text-red-600 hover:text-red-800 !hover:text-red-800"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 !text-gray-700">
                                    Link Type
                                  </label>
                                  <select
                                    value={link.type}
                                    onChange={(e) => updateLink(index, 'type', e.target.value)}
                                    className="input !bg-white !text-gray-900 !border-gray-300 !placeholder-gray-500"
                                  >
                                    <option value="github">GitHub Repository</option>
                                    <option value="live">Live Demo</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 !text-gray-700">
                                    URL *
                                  </label>
                                  <input
                                    type="url"
                                    value={link.url}
                                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                                    className="input !bg-white !text-gray-900 !border-gray-300 !placeholder-gray-500"
                                    placeholder={
                                      link.type === 'github' ? 'https://github.com/username/repository' :
                                        link.type === 'live' ? 'https://your-demo-url.com' :
                                          'https://your-link.com'
                                    }
                                    required
                                  />
                                </div>


                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addLink}
                            disabled={links.length >= (candidate.task_submission && candidate.task_submission.links ? 10 - candidate.task_submission.links.length : 10)}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 !border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 !text-gray-700 bg-white !bg-white hover:bg-gray-50 !hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add More Link
                          </button>

                          <p className="text-xs text-gray-500 !text-gray-500 text-center">
                            {candidate.task_submission && candidate.task_submission.links && candidate.task_submission.links.length > 0
                              ? `You can add up to ${10 - candidate.task_submission.links.length} more links. Existing links cannot be removed.`
                              : 'You can add up to 10 links. At least one link is required.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 !bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary sm:ml-3 sm:w-auto disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : (candidate.task_submission && candidate.task_submission.links && candidate.task_submission.links.length > 0 ? 'Add Links' : 'Submit Task')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTaskForm(false);
                        setLinks([{ url: '', type: 'other' }]);
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
    </div>
  );
};

export default CandidatePortal;
