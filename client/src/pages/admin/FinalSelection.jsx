import {
  CheckCircleIcon,
  DocumentTextIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { candidateService } from '../../services/candidateService';

const FinalSelection = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [decision, setDecision] = useState('');
  const [offerLetter, setOfferLetter] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await candidateService.getAllCandidates({
        status: ['Shortlisted', 'Interview Completed']
      });
      // Handle different response structures
      const candidatesData = response.data?.candidates || response.data || [];
      setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalDecision = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !decision) {
      toast.error('Please make a decision');
      return;
    }

    try {
      const updateData = {
        status: decision === 'selected' ? 'Selected' : 'Rejected',
        final_selection: {
          selected: decision === 'selected',
          selected_at: new Date().toISOString()
        }
      };

      await candidateService.updateCandidate(selectedCandidate._id, updateData);
      toast.success(`Candidate ${decision === 'selected' ? 'selected' : 'rejected'} successfully`);
      setSelectedCandidate(null);
      setDecision('');
      setOfferLetter(null);
      fetchCandidates();
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Shortlisted': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
      'Interview Completed': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
        {status}
      </span>
    );
  };

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
      <div>
        <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Final Selection</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
          Make final decisions on shortlisted candidates
        </p>
      </div>

      {/* Candidates Grid */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                    <div>
                      <Link to={`/admin/candidates/${candidate._id}`} className="text-lg font-semibold text-gray-900 dark:text-white">{candidate.name}</Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.job_id?.title || candidate.job?.title || 'N/A'}</p>
                    </div>
                  </div>
                  {getStatusBadge(candidate.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Application ID:</span> {candidate.application_id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Email:</span> {candidate.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Task Score:</span> {candidate.evaluation?.score || 'N/A'}%
                  </p>
                  {candidate.interview?.result && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Interview Result:</span> {candidate.interview.result}
                    </p>
                  )}
                  {candidate.interview?.feedback && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Interview Feedback:</span> {candidate.interview.feedback}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setDecision('selected');
                    }}
                    className="flex-1 btn btn-success flex items-center justify-center"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Select
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setDecision('rejected');
                    }}
                    className="flex-1 btn btn-danger flex items-center justify-center"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No candidates for final selection</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No candidates have been shortlisted or completed interviews yet.
          </p>
          <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            <p>Candidates need to be in "Shortlisted" or "Interview Completed" status to appear here.</p>
          </div>
        </div>
      )}

      {/* Final Decision Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleFinalDecision}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                        Final Decision - {selectedCandidate.name}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Decision
                          </label>
                          <div className="flex space-x-4">
                            <button
                              type="button"
                              onClick={() => setDecision('selected')}
                              className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center ${decision === 'selected'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                            >
                              <CheckCircleIcon className="h-5 w-5 mr-2" />
                              Select Candidate
                            </button>
                            <button
                              type="button"
                              onClick={() => setDecision('rejected')}
                              className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center ${decision === 'rejected'
                                ? 'border-red-500 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                            >
                              <XCircleIcon className="h-5 w-5 mr-2" />
                              Reject Candidate
                            </button>
                          </div>
                        </div>

                        {decision === 'selected' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Offer Letter (Optional)
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setOfferLetter(e.target.files[0])}
                              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-primary-200 hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
                            />
                          </div>
                        )}

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Candidate Summary</h4>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <p><span className="font-medium">Position:</span> {selectedCandidate.job_id?.title || selectedCandidate.job?.title || 'N/A'}</p>
                            <p><span className="font-medium">Task Score:</span> {selectedCandidate.evaluation?.score || 'N/A'}%</p>
                            <p><span className="font-medium">Interview Result:</span> {selectedCandidate.interview?.result || 'N/A'}</p>
                            {selectedCandidate.evaluation?.comments && (
                              <p><span className="font-medium">Evaluation Comments:</span> {selectedCandidate.evaluation.comments}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className={`btn sm:ml-3 sm:w-auto ${decision === 'selected' ? 'btn-success' : 'btn-danger'
                      }`}
                  >
                    {decision === 'selected' ? 'Select Candidate' : 'Reject Candidate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCandidate(null);
                      setDecision('');
                      setOfferLetter(null);
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

export default FinalSelection;
