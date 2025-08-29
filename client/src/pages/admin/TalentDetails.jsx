import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import { talentService } from '../../services/talentService';

const TalentDetails = () => {
  const { id } = useParams();
  const [talent, setTalent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        setLoading(true);
        const response = await talentService.getTalentById(id);
        setTalent(response.data?.talent || response.data || null);
      } catch (error) {
        console.error('Error fetching talent details:', error);
        setTalent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTalent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" />
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Talent not found</h1>
        <p className="text-gray-600 dark:text-gray-400">The talent you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Talent Details</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">Full profile and talent pool information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{talent.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{talent.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{talent.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Talent Pool ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{talent.talent_pool_id}</p>
                </div>
                {talent.reference && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Reference</p>
                    <p className="font-bold text-primary-600 dark:text-primary-400">{talent.reference.name || talent.reference.email || 'N/A'}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Years of Experience</p>
                  <p className="font-medium text-gray-900 dark:text-white">{talent.years_of_experience || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Expected Salary</p>
                  <p className="font-medium text-gray-900 dark:text-white">{talent.expected_salary ? `BDT ${talent.expected_salary.toLocaleString()}` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Notice Period</p>
                  <p className="font-medium text-gray-900 dark:text-white">{talent.notice_period_in_months ? `${talent.notice_period_in_months} month(s)` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Currently Employed</p>
                  <p className="font-medium text-gray-900 dark:text-white">{talent.current_employment_status ? 'Yes' : 'No'}</p>
                </div>
                {talent.current_company_name && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Current Company</p>
                    <p className="font-medium text-gray-900 dark:text-white">{talent.current_company_name}</p>
                  </div>
                )}
                {talent.write_about_yourself && talent.write_about_yourself.trim() !== "" && (
                  <div className="sm:col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">About Yourself</p>
                    <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{talent.write_about_yourself}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${talent.is_active
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                    {talent.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Submission Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {talent.submission_date ? new Date(talent.submission_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">Core Experience</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {talent.core_experience && talent.core_experience.length > 0 ? (
                      talent.core_experience.map((exp) => (
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
        </div>

        <div className="lg:col-span-1 space-y-6">
          {talent.cv_file_path && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CV</h2>
                <a
                  className="text-primary-600 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
                  href={talent.cv_file_path}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download CV
                </a>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to={`/admin/talents`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back to Talents
                </Link>
                <button
                  onClick={() => window.open(talent.cv_file_path, '_blank')}
                  disabled={!talent.cv_file_path}
                  className="block w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  View CV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDetails;
