import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900">Candidate not found</h1>
        <p className="text-gray-600">The candidate you are looking for does not exist.</p>
      </div>
    );
  }

  const job = candidate.job_id || candidate.job || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Details</h1>
        <p className="mt-1 text-sm text-gray-500">Full profile and application details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{candidate.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{candidate.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{candidate.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Application ID</p>
                  <p className="font-medium text-gray-900">{candidate.application_id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Evaluation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">{candidate.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Task Score</p>
                  <p className="font-medium text-gray-900">{candidate.evaluation?.score ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Interview</p>
                  <p className="font-medium text-gray-900">{candidate.interview?.scheduled_date ? new Date(candidate.interview.scheduled_date).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Interview Result</p>
                  <p className="font-medium text-gray-900">{candidate.interview?.result || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {Array.isArray(candidate.task_submission?.links) && candidate.task_submission.links.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Submission Links</h2>
                <ul className="list-disc ml-6 space-y-1">
                  {candidate.task_submission.links.map((link, idx) => (
                    <li key={idx}>
                      <a className="text-primary-600 hover:underline" href={link.url} target="_blank" rel="noreferrer">
                        {link.type || 'link'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job</h2>
              {job ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900">{job.title}</p>
                  <p className="text-gray-600">Job ID: {job.job_id}</p>
                  <p className="text-gray-600">Experience: {job.experience_in_year || 'N/A'}</p>
                  <Link to={`/admin/jobs/${job.job_id}`} className="text-primary-600 hover:underline text-sm">View job details</Link>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No job information</p>
              )}
            </div>
          </div>

          {candidate.cv_file_path && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">CV</h2>
                <a className="text-primary-600 hover:underline" href={candidate.cv_file_path} target="_blank" rel="noreferrer">Download CV</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;


