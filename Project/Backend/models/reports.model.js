// Get collection statistics
export async function getCollectionStats(db) {
  try {
    // Total collections
    const [totalCollections] = await db.query(
      "SELECT COUNT(*) as total FROM scrapCollection"
    );

    // Total revenue
    const [totalRevenue] = await db.query(
      "SELECT SUM(totalamount) as revenue FROM scrapCollection"
    );

    // Total agents
    const [totalAgents] = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'agent'"
    );

    // Collections this month
    const [monthlyCollections] = await db.query(
      `SELECT COUNT(*) as total FROM scrapCollection 
       WHERE MONTH(dateNtime) = MONTH(CURRENT_DATE()) 
       AND YEAR(dateNtime) = YEAR(CURRENT_DATE())`
    );

    // Revenue this month
    const [monthlyRevenue] = await db.query(
      `SELECT SUM(totalamount) as revenue FROM scrapCollection 
       WHERE MONTH(dateNtime) = MONTH(CURRENT_DATE()) 
       AND YEAR(dateNtime) = YEAR(CURRENT_DATE())`
    );

    return {
      totalCollections: totalCollections[0].total || 0,
      totalRevenue: totalRevenue[0].revenue || 0,
      totalAgents: totalAgents[0].total || 0,
      monthlyCollections: monthlyCollections[0].total || 0,
      monthlyRevenue: monthlyRevenue[0].revenue || 0
    };
  } catch (error) {
    console.error("Error in getCollectionStats:", error);
    throw error;
  }
}

// Get revenue statistics with date filtering
export async function getRevenueStats(db, startDate, endDate) {
  try {
    let query = "SELECT DATE(dateNtime) as date, SUM(totalamount) as revenue FROM scrapCollection";
    let params = [];

    if (startDate && endDate) {
      query += " WHERE DATE(dateNtime) BETWEEN ? AND ?";
      params = [startDate, endDate];
    } else {
      // Default to last 30 days
      query += " WHERE dateNtime >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)";
    }

    query += " GROUP BY DATE(dateNtime) ORDER BY date";

    const [revenueData] = await db.query(query, params);

    // Calculate total and average
    const total = revenueData.reduce((sum, row) => sum + (parseFloat(row.revenue) || 0), 0);
    const average = revenueData.length > 0 ? total / revenueData.length : 0;

    return {
      data: revenueData,
      total: total,
      average: average,
      count: revenueData.length
    };
  } catch (error) {
    console.error("Error in getRevenueStats:", error);
    throw error;
  }
}

// Get agent performance statistics
export async function getAgentPerformance(db, startDate, endDate) {
  try {
    let query = `
      SELECT 
        sc.agentname,
        sc.agent_MobileNo,
        COUNT(*) as collections,
        SUM(sc.totalamount) as revenue,
        AVG(sc.totalamount) as avgRevenue
      FROM scrapCollection sc
    `;
    let params = [];

    if (startDate && endDate) {
      query += " WHERE DATE(sc.dateNtime) BETWEEN ? AND ?";
      params = [startDate, endDate];
    }

    query += " GROUP BY sc.agentname, sc.agent_MobileNo ORDER BY revenue DESC";

    const [agentData] = await db.query(query, params);

    return agentData.map(agent => ({
      name: agent.agentname,
      mobile: agent.agent_MobileNo,
      collections: agent.collections,
      revenue: parseFloat(agent.revenue) || 0,
      avgRevenue: parseFloat(agent.avgRevenue) || 0
    }));
  } catch (error) {
    console.error("Error in getAgentPerformance:", error);
    throw error;
  }
}

// Get category-wise statistics
export async function getCategoryStats(db, startDate, endDate) {
  try {
    let query = `
      SELECT 
        sd.category,
        COUNT(*) as collections,
        SUM(sd.weight) as totalWeight,
        SUM(sd.subtotal) as revenue
      FROM scrapData sd
      JOIN scrapCollection sc ON sd.id = sc.id
    `;
    let params = [];

    if (startDate && endDate) {
      query += " WHERE DATE(sc.dateNtime) BETWEEN ? AND ?";
      params = [startDate, endDate];
    }

    query += " GROUP BY sd.category ORDER BY revenue DESC";

    const [categoryData] = await db.query(query, params);

    return categoryData.map(cat => ({
      category: cat.category,
      collections: cat.collections,
      totalWeight: parseFloat(cat.totalWeight) || 0,
      revenue: parseFloat(cat.revenue) || 0
    }));
  } catch (error) {
    console.error("Error in getCategoryStats:", error);
    throw error;
  }
}

// Get monthly trends for a specific year
export async function getMonthlyTrends(db, year) {
  try {
    const [monthlyData] = await db.query(`
      SELECT 
        MONTH(dateNtime) as month,
        COUNT(*) as collections,
        SUM(totalamount) as revenue
      FROM scrapCollection 
      WHERE YEAR(dateNtime) = ?
      GROUP BY MONTH(dateNtime)
      ORDER BY month
    `, [year]);

    // Fill in missing months with zero values
    const months = Array.from({length: 12}, (_, i) => ({
      month: i + 1,
      collections: 0,
      revenue: 0
    }));

    monthlyData.forEach(data => {
      months[data.month - 1] = {
        month: data.month,
        collections: data.collections,
        revenue: parseFloat(data.revenue) || 0
      };
    });

    return months;
  } catch (error) {
    console.error("Error in getMonthlyTrends:", error);
    throw error;
  }
}

// Get top customers by revenue
export async function getTopCustomers(db, limit = 10) {
  try {
    const [customerData] = await db.query(`
      SELECT 
        customername,
        customer_MobileNo,
        COUNT(*) as collections,
        SUM(totalamount) as totalRevenue,
        AVG(totalamount) as avgRevenue
      FROM scrapCollection 
      GROUP BY customername, customer_MobileNo 
      ORDER BY totalRevenue DESC 
      LIMIT ?
    `, [parseInt(limit)]);

    return customerData.map(customer => ({
      name: customer.customername,
      mobile: customer.customer_MobileNo,
      collections: customer.collections,
      totalRevenue: parseFloat(customer.totalRevenue) || 0,
      avgRevenue: parseFloat(customer.avgRevenue) || 0
    }));
  } catch (error) {
    console.error("Error in getTopCustomers:", error);
    throw error;
  }
}

// Get recent collections
export async function getRecentCollections(db, limit = 10) {
  try {
    const [recentData] = await db.query(`
      SELECT 
        id,
        agentname,
        customername,
        totalamount,
        paymentstatus,
        dateNtime
      FROM scrapCollection 
      ORDER BY dateNtime DESC 
      LIMIT ?
    `, [parseInt(limit)]);

    return recentData.map(collection => ({
      id: collection.id,
      agentName: collection.agentname,
      customerName: collection.customername,
      amount: parseFloat(collection.totalamount) || 0,
      paymentStatus: collection.paymentstatus,
      date: collection.dateNtime
    }));
  } catch (error) {
    console.error("Error in getRecentCollections:", error);
    throw error;
  }
}