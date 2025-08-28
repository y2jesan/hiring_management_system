import {
  DocumentArrowDownIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import Loader from '../../components/Loader';
import { experienceService } from '../../services/experienceService';
import { talentService } from '../../services/talentService';
import { userService } from '../../services/userService';

const animatedComponents = makeAnimated();

const Talents = () => {
  const [searchParams] = useSearchParams();
  const [talents, setTalents] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState('');
  const [experienceFilterIds, setExperienceFilterIds] = useState([]);
  const [yearsOfExperienceFilter, setYearsOfExperienceFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTalent, setEditingTalent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: '',
    reference: '',
    years_of_experience: '',
    expected_salary: '',
    notice_period_in_months: '',
    current_employment_status: '',
    current_company_name: '',
    core_experience: []
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }

    // Show filters if there are any active filters from URL
    if (statusFromUrl) {
      setShowFilters(true);
    }

    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [talentsResponse, usersResponse, experiencesResponse] = await Promise.all([
        talentService.getAllTalents(),
        userService.getAllUsers({ is_active: true }),
        experienceService.getAllExperiences({ active: true })
      ]);
      setTalents(talentsResponse.data?.talents || talentsResponse.data || []);
      setUsers(usersResponse.data?.users || usersResponse.data || []);
      setExperiences(experiencesResponse.data?.experiences || experiencesResponse.experiences || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view talents');
      } else {
        toast.error('Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (statusFilter) params.is_active = statusFilter === 'active';
      if (employmentStatusFilter) params.current_employment_status = employmentStatusFilter === 'employed';
      if (yearsOfExperienceFilter) params.min_experience = yearsOfExperienceFilter;
      if (salaryFilter) params.min_salary = salaryFilter;

      const blob = await talentService.exportTalents(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'talents.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Talents exported successfully');
    } catch (error) {
      console.error('Error exporting talents:', error);
      toast.error('Failed to export talents');
    }
  };

  const handleEdit = (talent) => {
    setEditingTalent(talent);
    setEditFormData({
      name: talent.name || '',
      email: talent.email || '',
      phone: talent.phone || '',
      is_active: talent.is_active ? 'active' : 'inactive',
      reference: talent.reference?._id || '',
      years_of_experience: talent.years_of_experience || '',
      expected_salary: talent.expected_salary || '',
      notice_period_in_months: talent.notice_period_in_months || '',
      current_employment_status: talent.current_employment_status ? 'employed' : 'unemployed',
      current_company_name: talent.current_company_name || '',
      core_experience: talent.core_experience ? talent.core_experience.map(exp => exp._id || exp) : []
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingTalent) return;

    try {
      setSubmitting(true);

      // Convert string values to proper data types before sending
      const updateData = {
        ...editFormData,
        is_active: editFormData.is_active === 'active',
        current_employment_status: editFormData.current_employment_status === 'employed',
        years_of_experience: parseFloat(editFormData.years_of_experience),
        expected_salary: parseFloat(editFormData.expected_salary),
        notice_period_in_months: parseInt(editFormData.notice_period_in_months)
      };

      await talentService.updateTalent(editingTalent._id, updateData);
      toast.success('Talent updated successfully');
      setShowEditModal(false);
      setEditingTalent(null);
      setEditFormData({
        name: '',
        email: '',
        phone: '',
        is_active: '',
        reference: '',
        years_of_experience: '',
        expected_salary: '',
        notice_period_in_months: '',
        current_employment_status: '',
        current_company_name: '',
        core_experience: []
      });
      fetchData();
    } catch (error) {
      console.error('Error updating talent:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update talent');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getEmploymentStatusBadge = (isEmployed) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isEmployed ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}`}>
        {isEmployed ? 'Employed' : 'Unemployed'}
      </span>
    );
  };

  const filteredTalents = talents.filter(talent => {
    const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.talent_pool_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (talent.current_company_name && talent.current_company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (talent.core_experience && talent.core_experience.some(exp =>
        exp.name && exp.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesStatus = !statusFilter || (statusFilter === 'active' ? talent.is_active : !talent.is_active);

    const matchesEmploymentStatus = !employmentStatusFilter ||
      (employmentStatusFilter === 'employed' ? talent.current_employment_status : !talent.current_employment_status);

    const matchesExperience = !experienceFilterIds.length ||
      (talent.core_experience && talent.core_experience.some(exp =>
        experienceFilterIds.includes(exp._id)
      ));

    const matchesYearsOfExperience = !yearsOfExperienceFilter ||
      (talent.years_of_experience && talent.years_of_experience >= parseFloat(yearsOfExperienceFilter));

    const matchesSalary = !salaryFilter ||
      (talent.expected_salary && talent.expected_salary >= parseFloat(salaryFilter));

    return matchesSearch && matchesStatus && matchesEmploymentStatus && matchesExperience && matchesYearsOfExperience && matchesSalary;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 admin-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Talent Pool</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
            Manage talent pool profiles and track potential candidates
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn btn-secondary flex items-center"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, talent pool ID, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-12 sm:pr-10 input"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 sm:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  <FunnelIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
                {(statusFilter || employmentStatusFilter || experienceFilterIds.length > 0 || yearsOfExperienceFilter || salaryFilter) && (
                  <span className="ml-2 bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                    {[statusFilter, employmentStatusFilter, experienceFilterIds.length > 0 ? 'exp' : '', yearsOfExperienceFilter, salaryFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employment Status
                  </label>
                  <select
                    value={employmentStatusFilter}
                    onChange={(e) => setEmploymentStatusFilter(e.target.value)}
                    className="input"
                  >
                    <option value="">All Employment Statuses</option>
                    <option value="employed">Currently Employed</option>
                    <option value="unemployed">Currently Unemployed</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Core Experience
                  </label>
                  <Select
                    isMulti
                    value={experiences.filter(exp => experienceFilterIds.includes(exp._id)).map(exp => ({
                      value: exp._id,
                      label: exp.name
                    }))}
                    onChange={(selectedOptions) => {
                      const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                      setExperienceFilterIds(selectedIds);
                    }}
                    options={experiences.map(exp => ({
                      value: exp._id,
                      label: exp.name
                    }))}
                    components={animatedComponents}
                    placeholder="Filter by experiences..."
                    className="w-full"
                    classNamePrefix="react-select"
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    noOptionsMessage={() => "No experiences available"}
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Years of Experience
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={yearsOfExperienceFilter}
                    onChange={(e) => setYearsOfExperienceFilter(e.target.value)}
                    className="input"
                    placeholder="e.g., 2"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Expected Salary (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salaryFilter}
                    onChange={(e) => setSalaryFilter(e.target.value)}
                    className="input"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">T</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Talents</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{talents.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {talents.filter(t => t.is_active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">E</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Employed</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {talents.filter(t => t.current_employment_status).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">E</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg Experience</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {talents.length > 0
                      ? (talents.reduce((sum, t) => sum + (t.years_of_experience || 0), 0) / talents.length).toFixed(1)
                      : '0'
                    } years
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg Expected Salary</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {talents.length > 0
                      ? `BDT ${(talents.reduce((sum, t) => sum + (t.expected_salary || 0), 0) / talents.length).toLocaleString()}`
                      : 'BDT 0'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Talents Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Talent
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employment
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Years of Experience
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Core Experience
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expected Salary
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTalents.map((talent, i) => (
                  <tr key={talent._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            <Link to={`/admin/talents/${talent._id}`} className="hover:underline">{talent.name}</Link>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {talent.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {talent.phone}
                          </div>
                          <Link to={`/talent/${talent.talent_pool_id}`} target='_blank' className="hover:underline text-sm text-primary-600">{talent.talent_pool_id}</Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {getStatusBadge(talent.is_active)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {getEmploymentStatusBadge(talent.current_employment_status)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {talent.years_of_experience ? `${talent.years_of_experience} years` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {talent.core_experience && talent.core_experience.length > 0 ? (
                        <div className="space-y-1">
                          {talent.core_experience.slice(0, 2).map((exp, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {exp.name}
                            </span>
                          ))}
                          {talent.core_experience.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{talent.core_experience.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {talent.expected_salary ? `BDT ${talent.expected_salary.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {talent.reference ? (
                        <div>
                          <div className="font-medium">{talent.reference.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{talent.reference.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No reference</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(talent.submission_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/admin/talents/${talent._id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleEdit(talent)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTalents.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No talents found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter ? 'Try adjusting your search or filter criteria.' : 'No talent profiles have been submitted yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Talent Modal */}
      {showEditModal && editingTalent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitEdit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                        Edit Talent - {editingTalent.name}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone *
                          </label>
                          <input
                            type="text"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status *
                          </label>
                          <select
                            value={editFormData.is_active}
                            onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value })}
                            className="mt-1 input"
                            required
                          >
                            <option value="">Select Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reference
                          </label>
                          <select
                            value={editFormData.reference}
                            onChange={(e) => setEditFormData({ ...editFormData, reference: e.target.value })}
                            className="mt-1 input"
                          >
                            <option value="">No Reference</option>
                            {users.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.name} - {user.email}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Years of Experience *
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={editFormData.years_of_experience}
                            onChange={(e) => setEditFormData({ ...editFormData, years_of_experience: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Expected Salary (BDT) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editFormData.expected_salary}
                            onChange={(e) => setEditFormData({ ...editFormData, expected_salary: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notice Period (Months) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editFormData.notice_period_in_months}
                            onChange={(e) => setEditFormData({ ...editFormData, notice_period_in_months: e.target.value })}
                            className="mt-1 input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Employment Status *
                          </label>
                          <select
                            value={editFormData.current_employment_status}
                            onChange={(e) => setEditFormData({ ...editFormData, current_employment_status: e.target.value })}
                            className="mt-1 input"
                            required
                          >
                            <option value="">Select Employment Status</option>
                            <option value="employed">Currently Employed</option>
                            <option value="unemployed">Currently Unemployed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Company Name
                          </label>
                          <input
                            type="text"
                            value={editFormData.current_company_name}
                            onChange={(e) => setEditFormData({ ...editFormData, current_company_name: e.target.value })}
                            className="mt-1 input"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Core Experience
                          </label>
                          <Select
                            isMulti
                            value={experiences.filter(exp => editFormData.core_experience.includes(exp._id)).map(exp => ({
                              value: exp._id,
                              label: exp.name
                            }))}
                            onChange={(selectedOptions) => {
                              const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                              setEditFormData({ ...editFormData, core_experience: selectedIds });
                            }}
                            options={experiences.map(exp => ({
                              value: exp._id,
                              label: exp.name
                            }))}
                            components={animatedComponents}
                            placeholder="Select core experiences..."
                            className="w-full"
                            classNamePrefix="react-select"
                            isClearable
                            isSearchable
                            closeMenuOnSelect={false}
                            noOptionsMessage={() => "No experiences available"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update Talent'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTalent(null);
                      setEditFormData({
                        name: '',
                        email: '',
                        phone: '',
                        is_active: '',
                        reference: '',
                        years_of_experience: '',
                        expected_salary: '',
                        notice_period_in_months: '',
                        current_employment_status: '',
                        current_company_name: '',
                        core_experience: []
                      });
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

export default Talents;
