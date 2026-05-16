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

// Get monthly revenue by category
export const getMonthlyCategoryRevenue = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year || new Date().getFullYear();
    
    const query = `
      SELECT 
        MONTH(sc.dateNtime) as month,
        sd.category,
        SUM(sd.subtotal) as revenue
      FROM scrapCollection sc
      JOIN scrapData sd ON sc.id = sd.id
      WHERE YEAR(sc.dateNtime) = ?
      GROUP BY MONTH(sc.dateNtime), sd.category
      ORDER BY month, sd.category
    `;
    
    const [rows] = await req.db.execute(query, [selectedYear]);
    
    // Transform data into monthly structure with categories
    const monthlyData = {};
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = { month: i, categories: {} };
    }
    
    rows.forEach(row => {
      monthlyData[row.month].categories[row.category] = parseFloat(row.revenue) || 0;
    });
    
    res.json(Object.values(monthlyData));
  } catch (error) {
    console.error("Error fetching monthly category revenue:", error);
    res.status(500).json({ error: "Error fetching monthly category revenue" });
  }
};

// Download PDF report
export const downloadPdfReport = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year || new Date().getFullYear();
    
    // Fetch all necessary data
    const [monthlyTrends, monthlyCategoryRevenue] = await Promise.all([
      getMonthlyTrends(req.db, selectedYear),
      getMonthlyCategoryData(req.db, selectedYear)
    ]);
    
    // For now, return JSON data (PDF generation will be added with a library)
    res.json({
      year: selectedYear,
      monthlyRevenue: monthlyTrends,
      categoryRevenue: monthlyCategoryRevenue,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    res.status(500).json({ error: "Error generating PDF report" });
  }
};

// Get agents list for PDF filter dropdown
export const getAgentsList = async (req, res) => {
  try {
    const [rows] = await req.db.execute(
      "SELECT DISTINCT agentname, agent_MobileNo FROM scrapCollection WHERE agentname IS NOT NULL ORDER BY agentname"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching agents list:", error);
    res.status(500).json({ error: "Error fetching agents list" });
  }
};

// Get filtered report data for PDF generation
export const getFilteredReportData = async (req, res) => {
  try {
    const { type, year, month, category, agentMobile } = req.query;
    const selectedYear = parseInt(year) || new Date().getFullYear();

    // Base conditions that apply to scrapCollection only
    const scWhere = [];
    const scParams = [];

    scWhere.push("YEAR(sc.dateNtime) = ?");
    scParams.push(selectedYear);

    if (type === 'monthly' && month) {
      scWhere.push("MONTH(sc.dateNtime) = ?");
      scParams.push(parseInt(month));
    }
    if (agentMobile && agentMobile !== 'all') {
      scWhere.push("sc.agent_MobileNo = ?");
      scParams.push(agentMobile);
    }

    // For category filter we need to scope to collection IDs that have that category
    let collectionIdSubquery = '';
    const catParams = [];
    if (category && category !== 'all') {
      collectionIdSubquery = `AND sc.id IN (SELECT id FROM scrapData WHERE category = ?)`;
      catParams.push(category);
    }

    const scWhereStr = `WHERE ${scWhere.join(' AND ')}`;

    // Summary — scrapCollection level only (totalamount is already the collection total)
    const summaryQuery = `
      SELECT 
        COUNT(sc.id) as totalCollections,
        COALESCE(SUM(sc.totalamount), 0) as totalRevenue,
        COUNT(DISTINCT sc.agent_MobileNo) as agentsCount
      FROM scrapCollection sc
      ${scWhereStr} ${collectionIdSubquery}
    `;
    const [summary] = await req.db.execute(summaryQuery, [...scParams, ...catParams]);

    // Monthly breakdown
    const monthlyQuery = `
      SELECT 
        MONTH(sc.dateNtime) as month,
        COUNT(sc.id) as collections,
        COALESCE(SUM(sc.totalamount), 0) as revenue
      FROM scrapCollection sc
      ${scWhereStr} ${collectionIdSubquery}
      GROUP BY MONTH(sc.dateNtime)
      ORDER BY month
    `;
    const [monthly] = await req.db.execute(monthlyQuery, [...scParams, ...catParams]);

    // Category breakdown — always join scrapData, apply category filter if set
    const catWhereExtra = category && category !== 'all' ? 'AND sd.category = ?' : '';
    const catBreakdownParams = [...scParams, ...(category && category !== 'all' ? [category] : [])];
    const categoryQuery = `
      SELECT 
        sd.category,
        COALESCE(SUM(sd.weight), 0) as totalWeight,
        COALESCE(SUM(sd.subtotal), 0) as revenue,
        COUNT(*) as items
      FROM scrapCollection sc
      JOIN scrapData sd ON sc.id = sd.id
      ${scWhereStr} ${catWhereExtra}
      GROUP BY sd.category
      ORDER BY revenue DESC
    `;
    const [categories] = await req.db.execute(categoryQuery, catBreakdownParams);

    // Agent breakdown
    const agentQuery = `
      SELECT 
        sc.agentname,
        sc.agent_MobileNo,
        COUNT(sc.id) as collections,
        COALESCE(SUM(sc.totalamount), 0) as revenue
      FROM scrapCollection sc
      ${scWhereStr} ${collectionIdSubquery}
      GROUP BY sc.agentname, sc.agent_MobileNo
      ORDER BY revenue DESC
    `;
    const [agents] = await req.db.execute(agentQuery, [...scParams, ...catParams]);

    res.json({
      filters: { type, year: selectedYear, month, category, agentMobile },
      summary: summary[0],
      monthly,
      categories,
      agents,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching filtered report data:", error);
    res.status(500).json({ error: "Error fetching filtered report data", detail: error.message });
  }
};

// Helper function to get monthly category data
async function getMonthlyCategoryData(db, year) {
  const query = `
    SELECT 
      MONTH(sc.dateNtime) as month,
      sd.category,
      SUM(sd.subtotal) as revenue
    FROM scrapCollection sc
    JOIN scrapData sd ON sc.id = sd.id
    WHERE YEAR(sc.dateNtime) = ?
    GROUP BY MONTH(sc.dateNtime), sd.category
    ORDER BY month, sd.category
  `;
  
  const [rows] = await db.execute(query, [year]);
  
  const monthlyData = {};
  for (let i = 1; i <= 12; i++) {
    monthlyData[i] = { month: i, categories: {} };
  }
  
  rows.forEach(row => {
    monthlyData[row.month].categories[row.category] = parseFloat(row.revenue) || 0;
  });
  
  return Object.values(monthlyData);
}
