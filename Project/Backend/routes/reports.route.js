import express from "express";
import { 
  getDashboardStats,
  getRevenueAnalytics,
  getAgentReport,
  getCategoryReport,
  getMonthlyReport,
  getCustomersReport,
  getComprehensiveReport,
  getMonthlyCategoryRevenue,
  downloadPdfReport,
  getAgentsList,
  getFilteredReportData
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

// Monthly revenue by category
router.get("/monthly-category", getMonthlyCategoryRevenue);

// Top customers
router.get("/customers", getCustomersReport);

// Comprehensive report (all data)
router.get("/comprehensive", getComprehensiveReport);

// Download PDF report
router.get("/download-pdf", downloadPdfReport);

// Agents list for PDF filter
router.get("/agents-list", getAgentsList);

// Filtered report data for PDF generation
router.get("/filtered-report", getFilteredReportData);

export default router;