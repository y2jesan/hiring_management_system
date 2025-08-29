import {
    AcademicCapIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentIcon,
    EnvelopeIcon,
    PhoneIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import qtecLogo from '../../assets/qtec_icon.svg';
import Loader from '../../components/Loader';
import { experienceService } from '../../services/experienceService';
import { talentService } from '../../services/talentService';

const animatedComponents = makeAnimated();

const TalentPortal = () => {
    const { talent_id } = useParams();
    const [talent, setTalent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCV, setSelectedCV] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [selectedExperiences, setSelectedExperiences] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm();

    useEffect(() => {
        fetchTalent();
        fetchExperiences();
    }, [talent_id]);

    const fetchTalent = async () => {
        try {
            setLoading(true);
            const response = await talentService.getTalentByTalentPoolId(talent_id);
            const talentData = response.data?.talent || response.data;
            setTalent(talentData);

            // Set form values
            if (talentData) {
                setValue('name', talentData.name);
                setValue('email', talentData.email);
                setValue('phone', talentData.phone);
                setValue('years_of_experience', talentData.years_of_experience);
                setValue('expected_salary', talentData.expected_salary);
                setValue('notice_period_in_months', talentData.notice_period_in_months);
                setValue('current_employment_status', talentData.current_employment_status.toString());
                setValue('current_company_name', talentData.current_company_name || '');

                // Set selected experiences
                if (talentData.core_experience) {
                    setSelectedExperiences(talentData.core_experience.map(exp => exp._id));
                }
            }
        } catch (error) {
            console.error('Error fetching talent:', error);
            toast.error('Failed to load talent information');
        } finally {
            setLoading(false);
        }
    };

    const fetchExperiences = async () => {
        try {
            const response = await experienceService.getActiveExperiences();
            const experiencesArray = response.data?.experiences || response.experiences || [];
            setExperiences(Array.isArray(experiencesArray) ? experiencesArray : []);
        } catch (error) {
            console.error('Error fetching experiences:', error);
            toast.error('Failed to load experiences');
        }
    };

    const onSubmit = async (data) => {
        if (data.name.length < 2) {
            toast.error('Name must be at least 2 characters');
            return;
        }
        if (!data.email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
            toast.error('Invalid email address');
            return;
        }
        if (!data.phone.match(/^01\d{9}$/)) {
            toast.error('Invalid phone number');
            return;
        }
        if (data.phone.length !== 11) {
            toast.error('Phone number must be 11 digits');
            return;
        }

        // Validate new fields
        if (!data.years_of_experience || parseFloat(data.years_of_experience) < 0) {
            toast.error('Years of experience must be a positive number');
            return;
        }

        if (!data.expected_salary || parseFloat(data.expected_salary) < 0) {
            toast.error('Expected salary must be a positive number');
            return;
        }

        if (!data.notice_period_in_months || parseInt(data.notice_period_in_months) < 0) {
            toast.error('Notice period must be a positive number');
            return;
        }

        // Validate core experience
        if (selectedExperiences.length === 0) {
            toast.error('At least one core experience is required');
            return;
        }

        try {
            setSubmitting(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('phone', data.phone);
            formData.append('years_of_experience', data.years_of_experience);
            formData.append('expected_salary', data.expected_salary);
            formData.append('notice_period_in_months', data.notice_period_in_months);
            formData.append('current_employment_status', data.current_employment_status);
            if (data.current_company_name) {
                formData.append('current_company_name', data.current_company_name);
            }
            selectedExperiences.forEach(expId => {
                formData.append('core_experience', expId);
            });

            if (selectedCV) {
                formData.append('cv', selectedCV);
            }

            await talentService.updateTalentByTalentPoolId(talent_id, formData);

            toast.success('Profile updated successfully!');
            setIsEditing(false);
            fetchTalent(); // Refresh data

        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile. Please try again.');
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 candidate-page">
                <Loader size="md" />
            </div>
        );
    }

    if (!talent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 candidate-page">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Talent Profile Not Found</h1>
                    <p className="text-gray-600">The talent profile you're looking for could not be found.</p>
                    <p className="text-sm text-gray-500 mt-2">Talent Pool ID: {talent_id}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 talent-portal-page candidate-page" style={{ colorScheme: 'light' }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <img src={qtecLogo} alt="QTEC Logo" className="h-12 w-12 mr-4" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-800 mb-2">QTEC Talent Portal</h1>
                    <p className="text-xl font-semibold text-gray-700 mb-4">
                        Welcome back, {talent.name}!
                    </p>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Your Talent Pool ID: <span className="font-bold text-primary-600">{talent.talent_pool_id}</span>
                    </p>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <UserIcon className="h-4 w-4 inline mr-1" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className={`input border-gray-300 placeholder-gray-500 ${errors.name ? 'border-red-500' : ''}`}
                                        placeholder="Enter your full name"
                                        {...register('name', {
                                            required: 'Full name is required',
                                            minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                        })}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className={`input border-gray-300 placeholder-gray-500 ${errors.email ? 'border-red-500' : ''}`}
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
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
                                    className={`input border-gray-300 placeholder-gray-500 ${errors.phone ? 'border-red-500' : ''}`}
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
                                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <BriefcaseIcon className="h-4 w-4 inline mr-1" />
                                        Years of Experience *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        className={`input border-gray-300 placeholder-gray-500 ${errors.years_of_experience ? 'border-red-500' : ''}`}
                                        placeholder="e.g. 1.5 years"
                                        {...register('years_of_experience', {
                                            required: 'Years of experience is required',
                                            min: {
                                                value: 0,
                                                message: 'Years of experience must be a positive number'
                                            }
                                        })}
                                    />
                                    {errors.years_of_experience && (
                                        <p className="mt-1 text-sm text-red-600">{errors.years_of_experience.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                                        Expected Salary (BDT) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className={`input border-gray-300 placeholder-gray-500 ${errors.expected_salary ? 'border-red-500' : ''}`}
                                        placeholder="e.g., 50000"
                                        {...register('expected_salary', {
                                            required: 'Expected salary is required',
                                            min: {
                                                value: 0,
                                                message: 'Expected salary must be a positive number'
                                            }
                                        })}
                                    />
                                    {errors.expected_salary && (
                                        <p className="mt-1 text-sm text-red-600">{errors.expected_salary.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <ClockIcon className="h-4 w-4 inline mr-1" />
                                        Notice Period (Months) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className={`input border-gray-300 placeholder-gray-500 ${errors.notice_period_in_months ? 'border-red-500' : ''}`}
                                        placeholder="e.g., 1"
                                        {...register('notice_period_in_months', {
                                            required: 'Notice period is required',
                                            min: {
                                                value: 0,
                                                message: 'Notice period must be a positive number'
                                            }
                                        })}
                                    />
                                    {errors.notice_period_in_months && (
                                        <p className="mt-1 text-sm text-red-600">{errors.notice_period_in_months.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                                    Currently Employed *
                                </label>
                                <select
                                    className={`input border-gray-300 placeholder-gray-500 ${errors.current_employment_status ? 'border-red-500' : ''}`}
                                    {...register('current_employment_status', {
                                        required: 'Please select your employment status'
                                    })}
                                >
                                    <option value="">Select employment status</option>
                                    <option value="true">Yes, I am currently employed</option>
                                    <option value="false">No, I am not currently employed</option>
                                </select>
                                {errors.current_employment_status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.current_employment_status.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                                    Current Company Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="input border-gray-300 placeholder-gray-500"
                                    placeholder="Enter your current company name"
                                    {...register('current_company_name')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                                    Core Experience *
                                </label>
                                <Select
                                    isMulti
                                    onChange={(selectedOptions) => {
                                        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                        setSelectedExperiences(selectedIds);
                                    }}
                                    options={experiences.map(exp => ({
                                        value: exp._id,
                                        label: exp.name
                                    }))}
                                    components={animatedComponents}
                                    placeholder="Select your core experiences..."
                                    className="w-full"
                                    classNamePrefix="react-select"
                                    isClearable
                                    isSearchable
                                    closeMenuOnSelect={false}
                                    noOptionsMessage={() => "No experiences available"}
                                    value={experiences
                                        .filter(exp => selectedExperiences.includes(exp._id))
                                        .map(exp => ({ value: exp._id, label: exp.name }))}
                                />
                                {selectedExperiences.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Selected: {selectedExperiences.length} experience{selectedExperiences.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Select your key technical skills and areas of expertise
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DocumentIcon className="h-4 w-4 inline mr-1" />
                                    Update CV/Resume (PDF, DOC, DOCX) - Optional
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleCVChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                />
                                {selectedCV && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Selected file: {selectedCV.name}
                                    </p>
                                )}
                                {talent.cv_file_path && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Current CV: <a href={talent.cv_file_path} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">View Current CV</a>
                                    </p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Maximum file size: 5MB. Accepted formats: PDF, DOC, DOCX
                                </p>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary px-8 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:border-primary-500 disabled:border"
                                >
                                    {submitting ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </div>
                                    ) : (
                                        'Update Profile'
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">{talent.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{talent.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Phone</p>
                                <p className="font-medium text-gray-900">{talent.phone}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Years of Experience</p>
                                <p className="font-medium text-gray-900">{talent.years_of_experience}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Expected Salary</p>
                                <p className="font-medium text-gray-900">BDT {talent.expected_salary?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Notice Period</p>
                                <p className="font-medium text-gray-900">{talent.notice_period_in_months} month(s)</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Currently Employed</p>
                                <p className="font-medium text-gray-900">{talent.current_employment_status ? 'Yes' : 'No'}</p>
                            </div>
                            {talent.current_company_name && (
                                <div>
                                    <p className="text-gray-500">Current Company</p>
                                    <p className="font-medium text-gray-900">{talent.current_company_name}</p>
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <p className="text-gray-500">Core Experience</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {talent.core_experience && talent.core_experience.length > 0 ? (
                                        talent.core_experience.map((exp) => (
                                            <span key={exp._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium !bg-primary-500 !text-white">
                                                {exp.name}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">No core experience listed</p>
                                    )}
                                </div>
                            </div>
                            {talent.cv_file_path && (
                                <div className="md:col-span-2">
                                    <p className="text-gray-500">CV</p>
                                    <a
                                        href={talent.cv_file_path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="!text-primary-600 hover:!text-primary-700 underline font-medium"
                                    >
                                        View Current CV
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Status Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="text-gray-500">Profile Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${talent.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {talent.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-500">Submission Date</p>
                            <p className="font-medium text-gray-900">
                                {talent.submission_date ? new Date(talent.submission_date).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TalentPortal;
