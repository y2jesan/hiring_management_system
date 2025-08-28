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
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import qtecLogo from '../../assets/qtec_icon.svg';
import Loader from '../../components/Loader';
import { experienceService } from '../../services/experienceService';
import { talentService } from '../../services/talentService';

const animatedComponents = makeAnimated();

// Custom styles for react-select to ensure light mode
const selectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: 'white !important',
        borderColor: state.isFocused ? '#3b82f6' : '#d1d5db !important',
        borderWidth: '1px',
        borderRadius: '0.375rem',
        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none !important',
        minHeight: '42px',
        '&:hover': {
            borderColor: '#3b82f6 !important'
        }
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'white !important',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        zIndex: 9999
    }),
    menuList: (provided) => ({
        ...provided,
        backgroundColor: 'white !important',
        padding: '4px'
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white !important',
        color: state.isSelected ? 'white' : '#374151',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6'
        }
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#dbeafe !important',
        borderRadius: '0.25rem',
        margin: '2px'
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#1e40af !important',
        fontWeight: '500'
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: '#1e40af !important',
        '&:hover': {
            backgroundColor: '#bfdbfe !important',
            color: '#1e3a8a !important'
        }
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#9ca3af !important'
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#374151 !important'
    }),
    input: (provided) => ({
        ...provided,
        color: '#374151 !important'
    }),
    valueContainer: (provided) => ({
        ...provided,
        backgroundColor: 'white !important'
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        backgroundColor: 'white !important'
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: '#d1d5db !important'
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: '#6b7280 !important',
        '&:hover': {
            color: '#374151 !important'
        }
    }),
    clearIndicator: (provided) => ({
        ...provided,
        color: '#6b7280 !important',
        '&:hover': {
            color: '#374151 !important'
        }
    })
};

const TalentPool = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCV, setSelectedCV] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [selectedExperiences, setSelectedExperiences] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        fetchExperiences();
    }, []);

    const fetchExperiences = async () => {
        try {
            const response = await experienceService.getActiveExperiences();
            const experiencesArray = response.data?.experiences || response.experiences || [];
            setExperiences(Array.isArray(experiencesArray) ? experiencesArray : []);
        } catch (error) {
            console.error('Error fetching experiences:', error);
            toast.error('Failed to load experiences');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        if (!selectedCV) {
            toast.error('Please upload your CV');
            return;
        }
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
            formData.append('cv', selectedCV);
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

            const resp = await talentService.createTalent(formData);
            const created = resp.data?.talent || resp.talent || resp.data;

            toast.success('Profile submitted successfully! We\'ll keep you in our talent pool and reach out when opportunities arise.');

            // Redirect to talent pool portal with talent pool id
            const talentPoolId = created?.talent_pool_id || created?.talentPoolId;
            if (talentPoolId) {
                navigate(`/talent/${talentPoolId}`);
                return;
            }

            // Fallback: Reset form
            setSelectedCV(null);
            document.getElementById('talent-pool-form').reset();

        } catch (error) {
            console.error('Error submitting profile:', error);
            toast.error('Failed to submit profile. Please try again.');
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader size="md" />
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    .talent-pool-page input[type="text"],
                    .talent-pool-page input[type="email"],
                    .talent-pool-page input[type="tel"],
                    .talent-pool-page input[type="number"],
                    .talent-pool-page select {
                        color: #374151 !important;
                        background-color: white !important;
                    }
                    .talent-pool-page input::placeholder {
                        color: #9ca3af !important;
                    }
                    .talent-pool-page select option {
                        color: #374151 !important;
                        background-color: white !important;
                    }
                    .talent-pool-page .react-select__control {
                        background-color: white !important;
                        border-color: #d1d5db !important;
                        box-shadow: none !important;
                    }
                    .talent-pool-page .react-select__control:hover {
                        border-color: #3b82f6 !important;
                    }
                    .talent-pool-page .react-select__control--is-focused {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 1px #3b82f6 !important;
                    }
                    .talent-pool-page .react-select__menu {
                        background-color: white !important;
                        border: 1px solid #d1d5db !important;
                    }
                    .talent-pool-page .react-select__option {
                        background-color: white !important;
                        color: #374151 !important;
                    }
                    .talent-pool-page .react-select__option--is-focused {
                        background-color: #f3f4f6 !important;
                    }
                    .talent-pool-page .react-select__option--is-selected {
                        background-color: #3b82f6 !important;
                        color: white !important;
                    }
                    .talent-pool-page .react-select__multi-value {
                        background-color: #dbeafe !important;
                    }
                    .talent-pool-page .react-select__multi-value__label {
                        color: #1e40af !important;
                    }
                    .talent-pool-page .react-select__multi-value__remove {
                        color: #1e40af !important;
                    }
                    .talent-pool-page .react-select__placeholder {
                        color: #9ca3af !important;
                    }
                    .talent-pool-page .react-select__single-value {
                        color: #374151 !important;
                    }
                    .talent-pool-page .react-select__input {
                        color: #374151 !important;
                    }
                    .talent-pool-page .react-select__indicator-separator {
                        background-color: #d1d5db !important;
                    }
                    .talent-pool-page .react-select__dropdown-indicator {
                        color: #6b7280 !important;
                    }
                    .talent-pool-page .react-select__clear-indicator {
                        color: #6b7280 !important;
                    }
                `}
            </style>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 talent-pool-page" style={{ colorScheme: 'light' }}>
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <img src={qtecLogo} alt="QTEC Logo" className="h-12 w-12 mr-4" />
                        </div>
                        <h1 className="text-3xl font-bold text-primary-800 mb-2">QTEC Talent Pool</h1>
                        <p className="text-xl font-semibold text-gray-700 mb-4">
                            "Not hiring today? You could still be the perfect fit tomorrow."
                        </p>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            At Qtec Solution, we're always on the lookout for passionate and skilled individuals.
                            Even if there's no open role that matches you right now, you can share your details with us.
                            We'll keep your profile in our Talent Pool and reach out when an opportunity that fits your skills comes up.
                        </p>
                    </div>

                    {/* Application Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Talent Pool Registration</h3>

                        <form id="talent-pool-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <UserIcon className="h-4 w-4 inline mr-1" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.name ? 'border-red-500' : ''}`}
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
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-500' : ''}`}
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
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.phone ? 'border-red-500' : ''}`}
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

                            <div className='grid-cols-1'>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <BriefcaseIcon className="h-4 w-4 inline mr-1" />
                                    Years of Experience *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.years_of_experience ? 'border-red-500' : ''}`}
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
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.expected_salary ? 'border-red-500' : ''}`}
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
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.notice_period_in_months ? 'border-red-500' : ''}`}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                                    Currently Employed *
                                </label>
                                <select
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white ${errors.current_employment_status ? 'border-red-500' : ''}`}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter your current company name"
                                    {...register('current_company_name')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                                    Core Experience *
                                </label>
                                <div
                                    className="light-mode-select-wrapper"
                                    style={{
                                        backgroundColor: 'white',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                        padding: '0'
                                    }}
                                >
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
                                        styles={selectStyles}
                                    />
                                </div>
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
                                    CV/Resume (PDF, DOC, DOCX)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleCVChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                    required
                                />
                                {selectedCV && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Selected file: {selectedCV.name}
                                    </p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Maximum file size: 5MB. Accepted formats: PDF, DOC, DOCX
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• You'll receive a confirmation email with your Talent Pool ID</li>
                                    <li>• We'll keep your profile in our database for future opportunities</li>
                                    <li>• When a suitable position opens up, we'll reach out to you</li>
                                    <li>• You can update your profile anytime through your talent portal</li>
                                </ul>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </div>
                                    ) : (
                                        'Submit Profile'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TalentPool;
