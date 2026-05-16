import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load env variables
dotenv.config({ path: './env.env' });

async function fixEnum() {
    let db;
    try {
        // Connect to database
        db = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            port: process.env.MYSQL_PORT,
        });
        console.log("✅ MySQL connected");

        // Check current enum values
        const [columns] = await db.query("SHOW COLUMNS FROM scrapCollection WHERE Field = 'approval_status'");
        
        if (columns.length === 0) {
            console.log("❌ approval_status column doesn't exist. Run the main migration first.");
            return;
        }

        console.log("Current approval_status enum:", columns[0].Type);

        // Check if 'collected' is already in the enum
        if (columns[0].Type.includes('collected')) {
            console.log("✅ 'collected' is already in the enum");
        } else {
            console.log("🔄 Adding 'collected' to the enum...");
            
            // Add 'collected' to the enum
            await db.query(`
                ALTER TABLE scrapCollection 
                MODIFY COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'collected') DEFAULT 'pending'
            `);
            
            console.log("✅ Successfully added 'collected' to the enum");
        }

        // Check if collected_at column exists
        const [collectedAtColumns] = await db.query("SHOW COLUMNS FROM scrapCollection WHERE Field = 'collected_at'");
        if (collectedAtColumns.length === 0) {
            console.log("🔄 Adding collected_at column...");
            await db.query(`
                ALTER TABLE scrapCollection 
                ADD COLUMN collected_at TIMESTAMP NULL DEFAULT NULL
            `);
            console.log("✅ Added collected_at column");
        } else {
            console.log("✅ collected_at column already exists");
        }

        // Test if we can now insert 'collected' status
        console.log("🧪 Testing 'collected' status insertion...");
        
        // Get a test collection
        const [testCollection] = await db.query("SELECT id FROM scrapCollection LIMIT 1");
        if (testCollection.length > 0) {
            const testId = testCollection[0].id;
            
            // Start transaction for test
            await db.beginTransaction();
            try {
                await db.query(
                    "UPDATE scrapCollection SET approval_status = 'collected' WHERE id = ?",
                    [testId]
                );
                console.log("✅ Successfully set status to 'collected'");
                await db.rollback(); // Rollback the test
            } catch (error) {
                await db.rollback();
                console.log("❌ Failed to set status to 'collected':", error.message);
            }
        }

        // Show final enum state
        const [finalColumns] = await db.query("SHOW COLUMNS FROM scrapCollection WHERE Field = 'approval_status'");
        console.log("Final approval_status enum:", finalColumns[0].Type);

        console.log("🎉 Enum fix completed!");

    } catch (error) {
        console.error("❌ Enum fix failed:", error);
    } finally {
        if (db) {
            await db.end();
        }
    }
}

fixEnum();