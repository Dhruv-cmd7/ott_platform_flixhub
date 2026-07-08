const User = require('../models/User');
const Movie = require('../models/Movie');
const Series = require('../models/Series');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const WatchHistory = require('../models/WatchHistory');
const Analytics = require('../models/Analytics');

/**
 * Get all dashboard metrics dynamically
 */
const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const premiumUsers = await User.countDocuments({ activeSubscription: { $ne: null } });
  
  const totalMovies = await Movie.countDocuments();
  const totalSeries = await Series.countDocuments();

  // Revenue Aggregations
  const totalRevenueResult = await Payment.aggregate([
    { $match: { status: 'captured' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const revenue = totalRevenueResult[0]?.total || 0;

  // Monthly Revenue Aggregations (Last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyRevenueResult = await Payment.aggregate([
    { $match: { status: 'captured', createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

  // Today's Revenue Aggregations (Since midnight)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayRevenueResult = await Payment.aggregate([
    { $match: { status: 'captured', createdAt: { $gte: todayStart } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const todayRevenue = todayRevenueResult[0]?.total || 0;

  // Watch Time Aggregations (convert seconds in WatchHistory to minutes)
  const watchTimeResult = await WatchHistory.aggregate([
    { $group: { _id: null, total: { $sum: '$watchedDuration' } } },
  ]);
  const watchTimeSeconds = watchTimeResult[0]?.total || 0;
  const watchTime = Math.round(watchTimeSeconds / 60); // In minutes

  // Trending Movies
  const trendingMovies = await Movie.find({ isPublished: true })
    .sort({ views: -1, averageRating: -1 })
    .limit(5)
    .populate('categories')
    .populate('genres')
    .populate('languages');

  // Active Subscriptions count
  const activeSubscriptions = await Subscription.countDocuments({
    status: 'active',
    endDate: { $gte: new Date() },
  });

  // Recent Payments list
  const recentPayments = await Payment.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email')
    .populate('plan', 'name price');

  // Recent Movies for dashboard table
  const recentMovies = await Movie.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .select('title views averageRating isPublished releaseYear');

  // Recent Users for dashboard sidebar
  const recentUsers = await User.find({})
    .sort({ createdAt: -1 })
    .limit(6)
    .select('name email status createdAt');

  return {
    // Normalized names used by both old and new frontend
    totalMovies,
    totalSeries,
    movies: totalMovies,
    series: totalSeries,
    totalUsers,
    activeUsers,
    activeSubscribers: activeSubscriptions,
    premiumUsers,
    revenue,
    monthlyRevenue,
    todayRevenue,
    watchTime,
    // Growth placeholders (would need historical data for real values)
    movieGrowth: 0,
    seriesGrowth: 0,
    subscriberGrowth: 0,
    revenueGrowth: 0,
    // Table data
    trendingMovies,
    recentMovies,
    recentUsers,
    activeSubscriptions,
    recentPayments,
  };
};

/**
 * Helper to record daily analytics snapshot
 */
const recordDailyAnalytics = async () => {
  const stats = await getDashboardStats();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Analytics.findOneAndUpdate(
    { date: today },
    {
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      premiumUsers: stats.premiumUsers,
      revenue: stats.todayRevenue,
      watchTime: stats.watchTime,
    },
    { upsert: true, new: true }
  );
};

module.exports = {
  getDashboardStats,
  recordDailyAnalytics,
};
