import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import qtecLogo from '../../assets/qtec_icon.svg';
import { candidateService } from '../../services/candidateService';
import { talentService } from '../../services/talentService';

const Track = () => {
    const [trackingResult, setTrackingResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState('application'); // 'talent' or 'application'
    const [notFound, setNotFound] = useState(false);
    const [searchedId, setSearchedId] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();

    const onSubmit = async (data) => {
        if (!data.trackId || data.trackId.trim() === '') {
            toast.error('Please enter a valid ID');
            return;
        }

        try {
            setLoading(true);
            setTrackingResult(null);
            setNotFound(false);
            setSearchedId(data.trackId.trim());

            if (searchType === 'talent') {
                // Search for talent
                const response = await talentService.getTalentByTalentPoolId(data.trackId.trim());
                const talent = response.data?.talent || response.data;

                if (talent) {
                    setTrackingResult({
                        type: 'talent',
                        data: talent,
                        name: talent.name,
                        id: talent.talent_pool_id,
                        link: `/talent/${talent.talent_pool_id}`
                    });
                } else {
                    setNotFound(true);
                }
            } else {
                // Search for job application
                const response = await candidateService.getCandidateByApplicationId(data.trackId.trim());
                const application = response.data?.candidate || response.data;

                if (application) {
                    setTrackingResult({
                        type: 'application',
                        data: application,
                        name: application.name,
                        id: application.application_id,
                        link: `/application/${application.application_id}`
                    });
                } else {
                    setNotFound(true);
                }
            }
        } catch (error) {
            console.error('Error tracking:', error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const handleNewSearch = () => {
        setTrackingResult(null);
        setNotFound(false);
        setSearchedId('');
        reset();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 track-page candidate-page" style={{ colorScheme: 'light' }}>
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <img src={qtecLogo} alt="QTEC Logo" className="h-12 w-12 mr-4" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-800 mb-2">Track Your Profile</h1>
                    <p className="text-lg text-gray-600">
                        Enter your ID to track your talent profile or job application
                    </p>
                </div>

                {!trackingResult && !notFound ? (
                    /* Search Form */
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Search Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    What would you like to track?
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="application"
                                            checked={searchType === 'application'}
                                            onChange={(e) => setSearchType(e.target.value)}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Job Application</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="talent"
                                            checked={searchType === 'talent'}
                                            onChange={(e) => setSearchType(e.target.value)}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Talent Profile</span>
                                    </label>

                                </div>
                            </div>

                            {/* ID Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {searchType === 'talent' ? 'Talent Pool ID' : 'Application ID'}
                                </label>
                                <input
                                    type="text"
                                    className={`input bg-white text-gray-600 border-gray-300 placeholder-gray-500 ${errors.trackId ? 'border-red-500' : ''}`}
                                    placeholder={searchType === 'talent' ? 'Enter your Talent Pool ID' : 'Enter your Application ID'}
                                    {...register('trackId', {
                                        required: 'ID is required',
                                        minLength: { value: 1, message: 'ID cannot be empty' }
                                    })}
                                />
                                {errors.trackId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.trackId.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary px-8 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:border-primary-500 disabled:border"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Searching...
                                    </div>
                                ) : (
                                    'Track Profile'
                                )}
                            </button>
                        </form>

                        {/* Help Text */}
                        <div className="bg-primary-50 border border-primary-500 rounded-lg p-4 mt-4">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Need help?</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• For Talent Pool: Use your Talent Pool ID (e.g., TP123456)</li>
                                <li>• For Job Applications: Use your Application ID (e.g., APP123456)</li>
                                <li>• Contact us if you've lost your ID</li>
                            </ul>
                        </div>
                    </div>
                ) : notFound ? (
                    /* Not Found Display */
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-center">
                            {/* Not Found Icon */}
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>

                            {/* Not Found Info */}
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                No {searchType === 'talent' ? 'Talent Profile' : 'Application'} Found
                            </h2>

                            <div className="mb-6">
                                <p className="text-gray-600 mb-1">Searched ID:</p>
                                <p className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                    {searchedId}
                                </p>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-600 text-sm">
                                    We couldn't find a {searchType === 'talent' ? 'talent profile' : 'job application'} with this ID.
                                    <br />
                                    Please check your ID and try again.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleNewSearch}
                                    className="block w-full btn btn-primary px-8 py-3 text-base font-medium"
                                >
                                    Try Another ID
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Results Display */
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-center">
                            {/* Success Icon */}
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            {/* Result Info */}
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {trackingResult.type === 'talent' ? 'Talent Profile Found!' : 'Job Application Found!'}
                            </h2>

                            <div className="mb-6">
                                <p className="text-gray-600 mb-1">Name:</p>
                                <p className="text-lg font-medium text-gray-900">{trackingResult.name}</p>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-600 mb-1">ID:</p>
                                <p className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                    {trackingResult.id}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Link
                                    to={trackingResult.link}
                                    className="block w-full btn btn-primary px-8 py-3 text-base font-medium"
                                >
                                    {trackingResult.type === 'talent' ? 'Go to Talent Portal' : 'Go to Application'}
                                </Link>

                                <button
                                    onClick={handleNewSearch}
                                    className="block w-full px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Search Another ID
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Track;

