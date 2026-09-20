const dashboardService = require('../services/dashboardService');

/**
 * @desc    Get business dashboard statistics & KPIs
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
