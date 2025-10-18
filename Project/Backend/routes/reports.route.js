import express from "express";
import { 
  getDashboardStats,
  getRevenueAnalytics,
  getAgentReport,
  getCategoryReport,
  getMonthlyReport,
  getCustomersReport,
  getComprehensiveReport
} from "../controllers/reports.controller.js";

const router = express.Router();

// Dashboard overview stats
router.get("/dashboard", getDashboardStats);

// Revenue analytics
router.get("/revenue", getRevenueAnalytics);

// Agent performance report
router.get("/agents", getAgentReport);

// Category-wise report
router.get("/categories", getCategoryReport);

// Monthly trends
router.get("/monthly", getMonthlyReport);

// Top customers
router.get("/customers", getCustomersReport);

// Comprehensive report (all data)
router.get("/comprehensive", getComprehensiveReport);

export default router;