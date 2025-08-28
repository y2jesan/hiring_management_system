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
                  <Link to={`/applications/${candidate.application_id}`} target='_blank' className="font-medium text-gray-900 dark:text-white hover:underline">{candidate.application_id}</Link>
                </div>
                {candidate.reference && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Reference</p>
                    <p className="font-bold text-primary-600 dark:text-primary-400">{candidate.reference.name || candidate.reference.email || 'N/A'}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Years of Experience</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.years_of_experience || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Expected Salary</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.expected_salary ? `BDT ${candidate.expected_salary.toLocaleString()}` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Notice Period</p>
                  <p className="font-medium text-gray-900 dark:text-white">{candidate.notice_period_in_months ? `${candidate.notice_period_in_months} month(s)` : 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">Core Experience</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {candidate.core_experience && candidate.core_experience.length > 0 ? (
                      candidate.core_experience.map((exp) => (
                        <span key={exp._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {exp.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500">No core experience listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Task Submission Section */}
          {Array.isArray(candidate.task_submission?.links) && candidate.task_submission.links.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Submission</h2>
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
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${link.type === 'github' ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200' :
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
              </div>
            </div>
          )}

          {(candidate.evaluation?.score !== undefined || candidate.evaluation?.evaluated_by || candidate.evaluation?.evaluated_at || candidate.evaluation?.comments) && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status & Evaluation</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">{candidate.status}</p>
                  </div>
                  {candidate.evaluation?.score !== undefined && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Task Score</p>
                      <p className="font-medium text-gray-900 dark:text-white">{candidate.evaluation.score}</p>
                    </div>
                  )}
                  {candidate.evaluation?.evaluated_by && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Evaluated By</p>
                      <p className="font-medium text-gray-900 dark:text-white">{candidate.evaluation.evaluated_by.name}</p>
                    </div>
                  )}
                  {candidate.evaluation?.evaluated_at && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Evaluated At</p>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(candidate.evaluation.evaluated_at).toLocaleString()}</p>
                    </div>
                  )}
                  {candidate.evaluation?.comments && (
                    <div className="sm:col-span-2">
                      <p className="text-gray-500 dark:text-gray-400">Evaluation Comments</p>
                      <p className="font-medium text-gray-900 dark:text-white">{candidate.evaluation.comments}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interview Information Section */}
          {Array.isArray(candidate.interviews) && candidate.interviews.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interview Information</h2>

                {/* Using interviews array; show summary from latest if available */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Latest Interview Summary</h3>
                  {(() => {
                    const latest = [...candidate.interviews].sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))[0];
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Scheduled Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">{new Date(latest.scheduled_date).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Interviewer</p>
                          <p className="font-medium text-gray-900 dark:text-white">{latest.interviewer?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Location</p>
                          <p className="font-medium text-gray-900 dark:text-white">{latest.location || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Result</p>
                          <p className="font-medium text-gray-900 dark:text-white">{latest.result || 'N/A'}</p>
                        </div>
                        {latest.completed_at && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Completed At</p>
                            <p className="font-medium text-gray-900 dark:text-white">{new Date(latest.completed_at).toLocaleString()}</p>
                          </div>
                        )}
                        {latest.meeting_link && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Meeting Link</p>
                            <a href={latest.meeting_link} target="_blank" rel="noreferrer" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Join Meeting</a>
                          </div>
                        )}
                        {latest.feedback && (
                          <div className="sm:col-span-2">
                            <p className="text-gray-500 dark:text-gray-400">Feedback</p>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <p className="text-gray-900 dark:text-white text-sm">{latest.feedback}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* All Interview Records */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">All Interview Records</h3>
                  <div className="space-y-4">
                    {[...candidate.interviews].sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date)).map((interview, index) => (
                      <div key={interview._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Interview #{index + 1}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${interview.result === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                            interview.result === 'Passed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                              interview.result === 'Failed' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                interview.result === 'No Show' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                                  'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}>
                            {interview.result}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Scheduled Date</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(interview.scheduled_date).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Interviewer</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {interview.interviewer?.name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Location</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {interview.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Scheduled By</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {interview.scheduled_by?.name || 'N/A'}
                            </p>
                          </div>
                          {interview.completed_at && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Completed At</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(interview.completed_at).toLocaleString()}
                              </p>
                            </div>
                          )}
                          {interview.completed_by && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Completed By</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {interview.completed_by.name}
                              </p>
                            </div>
                          )}
                          {interview.meeting_link && (
                            <div className="sm:col-span-2">
                              <p className="text-gray-500 dark:text-gray-400">Meeting Link</p>
                              <a
                                href={interview.meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                {interview.meeting_link}
                              </a>
                            </div>
                          )}
                        </div>

                        {interview.feedback && (
                          <div className="mt-3">
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Feedback:</p>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                              <p className="text-gray-900 dark:text-white text-sm">{interview.feedback}</p>
                            </div>
                          </div>
                        )}

                        {interview.notes && (
                          <div className="mt-3">
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Admin Notes:</p>
                            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-2">
                              <p className="text-gray-900 dark:text-white text-sm">{interview.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Selection Section */}
          {candidate.final_selection && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Final Selection</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Final Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">{candidate.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Selected</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {candidate.final_selection.selected ? 'Yes' : 'No'}
                    </p>
                  </div>
                  {candidate.final_selection.selected_by && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Selected By</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {candidate.final_selection.selected_by.name}
                      </p>
                    </div>
                  )}
                  {candidate.final_selection.selected_at && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Selected At</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(candidate.final_selection.selected_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {candidate.final_selection.offer_letter_path && (
                    <div className="sm:col-span-2">
                      <p className="text-gray-500 dark:text-gray-400">Offer Letter</p>
                      <a
                        href={candidate.final_selection.offer_letter_path}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Download Offer Letter
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-1 space-y-6">
          {job && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job</h2>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                  <p className="text-gray-600 dark:text-gray-400">Job ID: {job.job_id}</p>
                  <p className="text-gray-600 dark:text-gray-400">Experience: {job.experience_in_year || 'N/A'}</p>
                  <Link to={`/admin/jobs/${job.job_id}`} className="text-primary-600 hover:underline dark:text-primary-400 dark:hover:text-primary-300 text-sm">View job details</Link>
                </div>
              </div>
            </div>
          )}
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
  );
};

export default CandidateDetails;


