import express from "express";
import { 
    getPendingCollectionsForReview, 
    getCollectionDetails, 
    markCollectionAsCollected,
    getFactoryDashboardStats,
    getCollectedCollections
} from "../controllers/factory.controller.js";

const router = express.Router();

// Get dashboard stats
router.get("/dashboard/stats", getFactoryDashboardStats);

// Get all pending collections
router.get("/pending", getPendingCollectionsForReview);

// Get collected collections
router.get("/collected", getCollectedCollections);

// Get specific collection details
router.get("/collection/:id", getCollectionDetails);

// Mark collection as collected
router.post("/collection/:id/collect", markCollectionAsCollected);

export default router;