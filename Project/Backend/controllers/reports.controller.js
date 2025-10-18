import { 
  getCollectionStats, 
  getRevenueStats, 
  getAgentPerformance, 
  getCategoryStats,
  getMonthlyTrends,
  getTopCustomers,
  getRecentCollections
} from '../models/reports.model.js';

// Get dashboard overview stats
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getCollectionStats(req.db);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Error fetching dashboard statistics" });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const revenueData = await getRevenueStats(req.db, startDate, endDate);
    res.json(revenueData);
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    res.status(500).json({ error: "Error fetching revenue analytics" });
  }
};

// Get agent performance report
export const getAgentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const agentData = await getAgentPerformance(req.db, startDate, endDate);
    res.json(agentData);
  } catch (error) {
    console.error("Error fetching agent report:", error);
    res.status(500).json({ error: "Error fetching agent performance report" });
  }
};

// Get category-wise collection stats
export const getCategoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const categoryData = await getCategoryStats(req.db, startDate, endDate);
    res.json(categoryData);
  } catch (error) {
    console.error("Error fetching category report:", error);
    res.status(500).json({ error: "Error fetching category report" });
  }
};

// Get monthly trends
export const getMonthlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    const monthlyData = await getMonthlyTrends(req.db, year || new Date().getFullYear());
    res.json(monthlyData);
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    res.status(500).json({ error: "Error fetching monthly trends" });
  }
};

// Get top customers report
export const getCustomersReport = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const customersData = await getTopCustomers(req.db, limit);
    res.json(customersData);
  } catch (error) {
    console.error("Error fetching customers report:", error);
    res.status(500).json({ error: "Error fetching customers report" });
  }
};

// Get comprehensive report data
export const getComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const [
      dashboardStats,
      revenueStats,
      agentPerformance,
      categoryStats,
      monthlyTrends,
      topCustomers,
      recentCollections
    ] = await Promise.all([
      getCollectionStats(req.db),
      getRevenueStats(req.db, startDate, endDate),
      getAgentPerformance(req.db, startDate, endDate),
      getCategoryStats(req.db, startDate, endDate),
      getMonthlyTrends(req.db, new Date().getFullYear()),
      getTopCustomers(req.db, 5),
      getRecentCollections(req.db, 10)
    ]);

    res.json({
      overview: dashboardStats,
      revenue: revenueStats,
      agents: agentPerformance,
      categories: categoryStats,
      trends: monthlyTrends,
      customers: topCustomers,
      recent: recentCollections
    });
  } catch (error) {
    console.error("Error fetching comprehensive report:", error);
    res.status(500).json({ error: "Error fetching comprehensive report" });
  }
};