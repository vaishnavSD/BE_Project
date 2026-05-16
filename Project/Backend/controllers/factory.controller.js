import { getPendingCollections, markAsCollected, getCollectionById } from "../models/scrapCollecction.model.js";
import { getUserById } from "../models/users.model.js";

// Get all pending collections for factory review
export const getPendingCollectionsForReview = async (req, res) => {
    try {
        // Check if approval_status column exists
        try {
            const collections = await getPendingCollections(req.db);
            res.json({
                success: true,
                data: collections,
                message: `Found ${collections.length} collections pending review`
            });
        } catch (dbError) {
            // If approval_status column doesn't exist, return all collections as pending
            console.log("Database migration not run yet, returning all collections as pending");
            const [collections] = await req.db.query("SELECT * FROM scrapCollection ORDER BY dateNtime DESC");
            const [scrapData] = await req.db.query("SELECT * FROM scrapData");

            // Group scrapData by collection id
            const scrapDataById = {};
            for (const item of scrapData) {
                if (!scrapDataById[item.id]) scrapDataById[item.id] = [];
                scrapDataById[item.id].push(item);
            }

            // Attach scrapData array to each collection
            const collectionsWithItems = collections.map(col => ({
                ...col,
                approval_status: 'pending', // Default status
                scrapItems: scrapDataById[col.id] || []
            }));

            res.json({
                success: true,
                data: collectionsWithItems,
                message: `Found ${collectionsWithItems.length} collections pending review (migration required)`
            });
        }
    } catch (error) {
        console.error("Error fetching pending collections:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending collections",
            error: error.message
        });
    }
};

// Get collected collections
export const getCollectedCollections = async (req, res) => {
    try {
        // Check if collected_at column exists, if not use dateNtime for ordering
        let collections;
        try {
            const [result] = await req.db.query("SELECT * FROM scrapCollection WHERE approval_status = 'collected' ORDER BY collected_at DESC");
            collections = result;
        } catch (dbError) {
            // If collected_at column doesn't exist, use dateNtime for ordering
            console.log("collected_at column not found, using dateNtime for ordering");
            const [result] = await req.db.query("SELECT * FROM scrapCollection WHERE approval_status = 'collected' ORDER BY dateNtime DESC");
            collections = result;
        }

        const [scrapData] = await req.db.query("SELECT * FROM scrapData");

        // Group scrapData by collection id
        const scrapDataById = {};
        for (const item of scrapData) {
            if (!scrapDataById[item.id]) scrapDataById[item.id] = [];
            scrapDataById[item.id].push(item);
        }

        // Attach scrapData array to each collection
        const collectionsWithItems = collections.map(col => ({
            ...col,
            scrapItems: scrapDataById[col.id] || []
        }));

        res.json({
            success: true,
            data: collectionsWithItems,
            message: `Found ${collectionsWithItems.length} collected collections`
        });
    } catch (error) {
        console.error("Error fetching collected collections:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch collected collections",
            error: error.message
        });
    }
};

// Get collection details by ID
export const getCollectionDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollectionById(req.db, id);
        
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Collection not found"
            });
        }

        res.json({
            success: true,
            data: collection
        });
    } catch (error) {
        console.error("Error fetching collection details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch collection details",
            error: error.message
        });
    }
};

// Mark collection as collected
export const markCollectionAsCollected = async (req, res) => {
    try {
        const { id } = req.params;
        const { factoryEmployeeId, notes } = req.body;

        if (!factoryEmployeeId) {
            return res.status(400).json({
                success: false,
                message: "Factory employee ID is required"
            });
        }

        // Verify factory employee exists
        const employee = await getUserById(req.db, factoryEmployeeId);
        if (!employee || employee.role !== 'factory') {
            return res.status(400).json({
                success: false,
                message: "Invalid factory employee"
            });
        }

        const result = await markAsCollected(req.db, {
            collectionId: id,
            factoryEmployeeId,
            notes: notes || 'Collected by factory'
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Collection not found or already processed"
            });
        }

        res.json({
            success: true,
            message: "Collection marked as collected successfully",
            data: { collectionId: id, status: 'collected' }
        });
    } catch (error) {
        console.error("Error marking collection as collected:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark collection as collected",
            error: error.message
        });
    }
};

// Get factory dashboard stats
export const getFactoryDashboardStats = async (req, res) => {
    try {
        // Check if approval_status column exists, if not return default values
        try {
            const [pendingCount] = await req.db.query("SELECT COUNT(*) as count FROM scrapCollection WHERE approval_status = 'pending'");
            const [collectedCount] = await req.db.query("SELECT COUNT(*) as count FROM scrapCollection WHERE approval_status = 'collected'");
            const [totalAmount] = await req.db.query("SELECT SUM(totalamount) as total FROM scrapCollection WHERE approval_status = 'collected'");

            res.json({
                success: true,
                data: {
                    pending: pendingCount[0].count,
                    collected: collectedCount[0].count,
                    totalCollectedAmount: totalAmount[0].total || 0
                }
            });
        } catch (dbError) {
            // If approval_status column doesn't exist, return default values
            console.log("Database migration not run yet, returning default values");
            const [totalCollections] = await req.db.query("SELECT COUNT(*) as count FROM scrapCollection");
            
            res.json({
                success: true,
                data: {
                    pending: totalCollections[0].count, // All collections are pending until migration
                    collected: 0,
                    totalCollectedAmount: 0
                },
                message: "Database migration required for full factory functionality"
            });
        }
    } catch (error) {
        console.error("Error fetching factory dashboard stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats",
            error: error.message
        });
    }
};