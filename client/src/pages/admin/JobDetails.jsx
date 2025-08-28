import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import { jobService } from '../../services/jobService';

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await jobService.getJobByJobId(jobId);
        setJob(response.data?.job || response.data || null);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Job not found</h1>
        <p className="text-gray-600 dark:text-gray-400">The job you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200">{job.title}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">Job ID: {job.job_id}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-medium">Designation:</span> {job.designation}
          </div>
          <div>
            <span className="font-medium">Experience:</span> {job.experience_in_year || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Salary Range:</span> {job.salary_range}
          </div>
          <div>
            <span className="font-medium">Status:</span> {job.is_active ? 'Active' : 'Closed'}
          </div>
        </div>
        {job.evaluators && job.evaluators.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Evaluators</h3>
            <div className="flex flex-wrap gap-2">
              {job.evaluators.map((evaluator, index) => (
                <span
                  key={evaluator._id || index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                >
                  <strong>{evaluator.name}</strong>
                  {evaluator.role && (
                    <span className="ml-1 text-xs opacity-75">({evaluator.role})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.job_description && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Job Description</h3>
            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{
                  __html: job.job_description
                    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">$1</h1>')
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
  );
};

export default JobDetails;


