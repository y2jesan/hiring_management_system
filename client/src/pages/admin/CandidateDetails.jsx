import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import { candidateService } from '../../services/candidateService';

const CandidateDetails = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const response = await candidateService.getCandidateById(id);
        setCandidate(response.data?.candidate || response.data || null);
      } catch (error) {
        console.error('Error fetching candidate details:', error);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  if (loading) {
          return (
        <div className="flex items-center justify-center h-64">
          <Loader size="md" />
        </div>
      );
  }

  if (!candidate) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Candidate not found</h1>
        <p className="text-gray-600 dark:text-gray-400">The candidate you are looking for does not exist.</p>
      </div>
    );
  }

  const job = candidate.job_id || candidate.job || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Candidate Details</h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">Full profile and application details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Application ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.application_id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status & Evaluation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.status}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Task Score</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.evaluation?.score ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Interview</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.interview?.scheduled_date ? new Date(candidate.interview.scheduled_date).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Interview Result</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.interview?.result || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task Submission Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Submission</h2>
              {Array.isArray(candidate.task_submission?.links) && candidate.task_submission.links.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Submitted Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {candidate.task_submission.submitted_at 
                          ? new Date(candidate.task_submission.submitted_at).toLocaleString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Total Links</p>
                      <p className="font-medium text-gray-900 dark:text-white">{candidate.task_submission.links.length}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Submitted Links:</p>
                    <div className="space-y-2">
                      {candidate.task_submission.links.map((link, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border dark:border-gray-600">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              link.type === 'github' ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200' :
                              link.type === 'live' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                              'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}>
                              {link.type || 'other'}
                            </span>
                          </div>
                          <a 
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 break-all text-sm" 
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer"
                          >
                            {link.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No task submission yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    {candidate.status === 'Applied' ? 'Waiting for task assignment' : 
                     candidate.status === 'Task Pending' ? 'Task assigned, waiting for submission' :
                     'Task not submitted'}
                  </p>
                </div>
              )}
            </div>
          </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job</h2>
              {job ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                  <p className="text-gray-600 dark:text-gray-400">Job ID: {job.job_id}</p>
                  <p className="text-gray-600 dark:text-gray-400">Experience: {job.experience_in_year || 'N/A'}</p>
                  <Link to={`/admin/jobs/${job.job_id}`} className="text-primary-600 hover:underline dark:text-primary-400 dark:hover:text-primary-300 text-sm">View job details</Link>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-sm">No job information</p>
              )}
            </div>
          </div>

          {candidate.cv_file_path && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CV</h2>
                <a className="text-primary-600 hover:underline dark:text-primary-400 dark:hover:text-primary-300" href={candidate.cv_file_path} target="_blank" rel="noreferrer">Download CV</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default CandidateDetails;


