const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Interview = require('../models/Interview');
const User = require('../models/User');
const { createSuccessResponse, createErrorResponse } = require('../helpers/utils');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const [
      totalJobs,
      activeJobs,
      totalCandidates,
      totalUsers,
      totalInterviews
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ is_active: true }),
      Candidate.countDocuments(),
      User.countDocuments({ is_active: true }),
      Interview.countDocuments()
    ]);

    // Get candidate status counts
    const candidateStatusStats = await Candidate.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object for easier access
    const statusCounts = {};
    candidateStatusStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentApplications = await Candidate.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get upcoming interviews
    const upcomingInterviews = await Interview.countDocuments({
      scheduled_date: { $gte: new Date() },
      result: 'Pending'
    });

    // Get interview results
    const interviewResults = await Interview.aggregate([
      {
        $group: {
          _id: '$result',
          count: { $sum: 1 }
        }
      }
    ]);

    const resultCounts = {};
    interviewResults.forEach(result => {
      resultCounts[result._id] = result.count;
    });

    // Calculate pass rate
    const totalCompletedInterviews = (resultCounts['Passed'] || 0) + (resultCounts['Failed'] || 0) + (resultCounts['No Show'] || 0);
    const passRate = totalCompletedInterviews > 0 ? 
      Math.round(((resultCounts['Passed'] || 0) / totalCompletedInterviews) * 100) : 0;

    // Get top performing jobs
    const topJobs = await Job.aggregate([
      {
        $lookup: {
          from: 'candidates',
          localField: '_id',
          foreignField: 'job_id',
          as: 'candidates'
        }
      },
      {
        $project: {
          title: 1,
          job_id: 1,
          candidateCount: { $size: '$candidates' }
        }
      },
      {
        $sort: { candidateCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get monthly application trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Candidate.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const stats = {
      overview: {
        totalJobs,
        activeJobs,
        totalCandidates,
        totalUsers,
        totalInterviews,
        recentApplications,
        upcomingInterviews
      },
      candidateStatus: statusCounts,
      interviewResults: resultCounts,
      passRate,
      topJobs,
      monthlyTrends
    };

    res.json(createSuccessResponse({ stats }));
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch dashboard statistics'));
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Applications over time
    const applicationsOverTime = await Candidate.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Status distribution
    const statusDistribution = await Candidate.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Job-wise applications
    const jobWiseApplications = await Job.aggregate([
      {
        $lookup: {
          from: 'candidates',
          localField: '_id',
          foreignField: 'job_id',
          as: 'candidates'
        }
      },
      {
        $project: {
          title: 1,
          job_id: 1,
          applicationCount: { $size: '$candidates' },
          selectedCount: {
            $size: {
              $filter: {
                input: '$candidates',
                cond: { $eq: ['$$this.status', 'Selected'] }
              }
            }
          }
        }
      },
      {
        $sort: { applicationCount: -1 }
      }
    ]);

    // Interview success rate by interviewer
    const interviewerSuccessRate = await Interview.aggregate([
      {
        $match: {
          result: { $in: ['Passed', 'Failed'] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'interviewer_id',
          foreignField: '_id',
          as: 'interviewer'
        }
      },
      {
        $unwind: '$interviewer'
      },
      {
        $group: {
          _id: '$interviewer_id',
          interviewerName: { $first: '$interviewer.name' },
          totalInterviews: { $sum: 1 },
          passedInterviews: {
            $sum: { $cond: [{ $eq: ['$result', 'Passed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          interviewerName: 1,
          totalInterviews: 1,
          passedInterviews: 1,
          successRate: {
            $round: [
              { $multiply: [{ $divide: ['$passedInterviews', '$totalInterviews'] }, 100] },
              2
            ]
          }
        }
      },
      {
        $sort: { successRate: -1 }
      }
    ]);

    // Task evaluation statistics
    const taskEvaluationStats = await Candidate.aggregate([
      {
        $match: {
          'evaluation.score': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$evaluation.score' },
          maxScore: { $max: '$evaluation.score' },
          minScore: { $min: '$evaluation.score' },
          totalEvaluated: { $sum: 1 },
          passedCount: {
            $sum: { $cond: [{ $gte: ['$evaluation.score', 60] }, 1, 0] }
          }
        }
      }
    ]);

    const analytics = {
      applicationsOverTime,
      statusDistribution,
      jobWiseApplications,
      interviewerSuccessRate,
      taskEvaluationStats: taskEvaluationStats[0] || {
        averageScore: 0,
        maxScore: 0,
        minScore: 0,
        totalEvaluated: 0,
        passedCount: 0
      }
    };

    res.json(createSuccessResponse({ analytics }));
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch analytics data'));
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent candidates
    const recentCandidates = await Candidate.find()
      .populate('job_id', 'title job_id')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get recent interviews
    const recentInterviews = await Interview.find()
      .populate('candidate_id', 'name email')
      .populate('interviewer_id', 'name')
      .sort({ scheduled_date: -1 })
      .limit(parseInt(limit));

    // Get recent job postings
    const recentJobs = await Job.find()
      .populate('created_by', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const activities = {
      recentCandidates,
      recentInterviews,
      recentJobs
    };

    res.json(createSuccessResponse({ activities }));
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch recent activities'));
  }
};

// Export candidate data
const exportCandidateData = async (req, res) => {
  try {
    const { format = 'excel', status, job_id } = req.query;

    const query = {};
    if (status) query.status = status;
    if (job_id) query.job_id = job_id;

    const candidates = await Candidate.find(query)
      .populate('job_id', 'title designation job_id')
      .populate('evaluation.evaluated_by', 'name email')
      .populate('interview.interviewer', 'name email')
      .populate('final_selection.selected_by', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'excel') {
      // For Excel export, you would use a library like exceljs
      // This is a simplified version
      const excelData = candidates.map(candidate => ({
        'Application ID': candidate.application_id,
        'Name': candidate.name,
        'Email': candidate.email,
        'Phone': candidate.phone,
        'Job Title': candidate.job_id?.title || 'N/A',
        'Job ID': candidate.job_id?.job_id || 'N/A',
        'Status': candidate.status,
        'Applied Date': candidate.createdAt.toLocaleDateString(),
        'Task Score': candidate.evaluation?.score || 'N/A',
        'Evaluated By': candidate.evaluation?.evaluated_by?.name || 'N/A',
        'Interview Date': candidate.interview?.scheduled_date ? 
          new Date(candidate.interview.scheduled_date).toLocaleDateString() : 'N/A',
        'Interviewer': candidate.interview?.interviewer?.name || 'N/A',
        'Interview Result': candidate.interview?.result || 'N/A',
        'Final Selection': candidate.final_selection?.selected ? 'Selected' : 'Not Selected',
        'Selected By': candidate.final_selection?.selected_by?.name || 'N/A'
      }));

      res.json(createSuccessResponse({ 
        data: excelData,
        message: 'Data prepared for Excel export'
      }));
    } else {
      res.json(createSuccessResponse({ candidates }));
    }
  } catch (error) {
    console.error('Export candidate data error:', error);
    res.status(500).json(createErrorResponse('Failed to export candidate data'));
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getRecentActivities,
  exportCandidateData
};
