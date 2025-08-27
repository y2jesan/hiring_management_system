import {
    EyeIcon,
    EyeSlashIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import { experienceService } from '../../services/experienceService';

const Experiences = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [editingExperience, setEditingExperience] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        active: true
    });

    useEffect(() => {
        fetchExperiences();
    }, []);

    const fetchExperiences = async () => {
        try {
            setLoading(true);
            const params = {};

            if (searchTerm) {
                params.search = searchTerm;
            }

            if (activeFilter !== '') {
                params.active = activeFilter === 'true';
            }

            const response = await experienceService.getAllExperiences(params);
            const experiencesArray = response.data?.experiences || response.experiences || [];
            setExperiences(Array.isArray(experiencesArray) ? experiencesArray : []);
        } catch (error) {
            console.error('Error fetching experiences:', error);
            toast.error('Failed to fetch experiences');
            setExperiences([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Experience name is required');
            return;
        }

        try {
            setSubmitting(true);

            if (editingExperience) {
                await experienceService.updateExperience(editingExperience._id, formData);
                toast.success('Experience updated successfully');
            } else {
                await experienceService.createExperience(formData);
                toast.success('Experience created successfully');
            }

            resetForm();
            fetchExperiences();
        } catch (error) {
            console.error('Error saving experience:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to save experience');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (experience) => {
        setEditingExperience(experience);
        setFormData({
            name: experience.name,
            active: experience.active
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this experience?')) {
            return;
        }

        try {
            await experienceService.deleteExperience(id);
            toast.success('Experience deleted successfully');
            fetchExperiences();
        } catch (error) {
            console.error('Error deleting experience:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to delete experience');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await experienceService.toggleExperienceStatus(id);
            toast.success('Experience status updated successfully');
            fetchExperiences();
        } catch (error) {
            console.error('Error toggling experience status:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to update experience status');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            active: true
        });
        setEditingExperience(null);
    };

    const handleSearch = () => {
        fetchExperiences();
    };

    const handleFilterChange = () => {
        fetchExperiences();
    };

    const filteredExperiences = experiences.filter(experience => {
        const matchesSearch = experience.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === '' || experience.active.toString() === activeFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="md" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Experiences</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
                        Manage experience categories for job applications
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Experiences List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Experiences</h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {filteredExperiences.length} experience{filteredExperiences.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {/* Search and Filter */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search experiences..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-10 input"
                                        />
                                    </div>
                                </div>
                                <div className="sm:w-48">
                                    <select
                                        value={activeFilter}
                                        onChange={(e) => {
                                            setActiveFilter(e.target.value);
                                            handleFilterChange();
                                        }}
                                        className="input"
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Experiences List */}
                            <div className="space-y-3">
                                {filteredExperiences.length > 0 ? (
                                    filteredExperiences.map((experience) => (
                                        <div
                                            key={experience._id}
                                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-3 h-3 rounded-full ${experience.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {experience.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Created: {new Date(experience.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleToggleStatus(experience._id)}
                                                    className={`p-2 rounded-lg transition-colors ${experience.active
                                                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                    title={experience.active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {experience.active ? (
                                                        <EyeIcon className="h-4 w-4" />
                                                    ) : (
                                                        <EyeSlashIcon className="h-4 w-4" />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(experience)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(experience._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                            {searchTerm || activeFilter !== '' ? 'No experiences match your criteria.' : 'No experiences found'}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {searchTerm || activeFilter !== '' ? 'Try adjusting your search or filter criteria.' : 'Get started by creating a new experience.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Create/Edit Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {editingExperience ? 'Edit Experience' : 'Create Experience'}
                                </h3>
                                {editingExperience && (
                                    <button
                                        onClick={resetForm}
                                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Experience Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 input"
                                        placeholder="e.g., 0-1 years, 1-3 years, 3-5 years"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !formData.name.trim()}
                                    className="w-full btn btn-primary disabled:opacity-50 flex justify-center"
                                >
                                    {submitting ? (
                                        'Saving...'
                                    ) : editingExperience ? (
                                        <><PencilIcon className="h-4 w-4 mr-2" />Update Experience</>
                                    ) : (
                                        <><PlusIcon className="h-4 w-4 mr-2" />Create Experience</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Experiences;
