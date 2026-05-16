import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load env variables
dotenv.config({ path: './env.env' });

async function testFactoryAPI() {
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

        console.log("\n🧪 Testing Factory API Functions...\n");

        // Test 1: Check table structure
        console.log("1️⃣ Checking scrapCollection table structure:");
        const [columns] = await db.query("SHOW COLUMNS FROM scrapCollection");
        console.log("Columns:", columns.map(col => `${col.Field} (${col.Type})`).join(', '));

        // Test 2: Check if approval_status column exists and its values
        const approvalStatusColumn = columns.find(col => col.Field === 'approval_status');
        if (approvalStatusColumn) {
            console.log("✅ approval_status column exists:", approvalStatusColumn.Type);
            
            // Check current status distribution
            const [statusCounts] = await db.query(`
                SELECT approval_status, COUNT(*) as count 
                FROM scrapCollection 
                GROUP BY approval_status
            `);
            console.log("Status distribution:", statusCounts);
        } else {
            console.log("❌ approval_status column missing - migration needed");
        }

        // Test 3: Check collected_at column
        const collectedAtColumn = columns.find(col => col.Field === 'collected_at');
        if (collectedAtColumn) {
            console.log("✅ collected_at column exists");
        } else {
            console.log("❌ collected_at column missing");
        }

        // Test 4: Test pending collections query
        console.log("\n2️⃣ Testing pending collections query:");
        try {
            const [pendingCollections] = await db.query("SELECT COUNT(*) as count FROM scrapCollection WHERE approval_status = 'pending'");
            console.log("✅ Pending collections count:", pendingCollections[0].count);
        } catch (error) {
            console.log("❌ Pending collections query failed:", error.message);
        }

        // Test 5: Test collected collections query
        console.log("\n3️⃣ Testing collected collections query:");
        try {
            const [collectedCollections] = await db.query("SELECT COUNT(*) as count FROM scrapCollection WHERE approval_status = 'collected'");
            console.log("✅ Collected collections count:", collectedCollections[0].count);
        } catch (error) {
            console.log("❌ Collected collections query failed:", error.message);
        }

        // Test 6: Test dashboard stats query
        console.log("\n4️⃣ Testing dashboard stats queries:");
        try {
            const [pendingCount] = await db.query("SELECT COUNT(*) as count FROM scrapCollection WHERE approval_status = 'pending'");
            const [collectedCount] = await db.query("SELECT COUNT(*) as count FROM scrapCollection WHERE approval_status = 'collected'");
            const [totalAmount] = await db.query("SELECT SUM(totalamount) as total FROM scrapCollection WHERE approval_status = 'collected'");
            
            console.log("✅ Dashboard stats:");
            console.log("  - Pending:", pendingCount[0].count);
            console.log("  - Collected:", collectedCount[0].count);
            console.log("  - Total Amount:", totalAmount[0].total || 0);
        } catch (error) {
            console.log("❌ Dashboard stats query failed:", error.message);
        }

        // Test 7: Test markAsCollected functionality (simulation)
        console.log("\n5️⃣ Testing markAsCollected functionality:");
        
        // First, get a pending collection if any
        try {
            const [pendingCollection] = await db.query("SELECT id FROM scrapCollection WHERE approval_status = 'pending' LIMIT 1");
            
            if (pendingCollection.length > 0) {
                const collectionId = pendingCollection[0].id;
                console.log("Found pending collection:", collectionId);
                
                // Test the update query (but rollback)
                await db.beginTransaction();
                try {
                    const [updateResult] = await db.query(
                        "UPDATE scrapCollection SET approval_status = 'collected', factory_employee_id = ?, factory_notes = ?, collected_at = NOW() WHERE id = ?",
                        [1, 'Test collection', collectionId]
                    );
                    console.log("✅ markAsCollected update successful, affected rows:", updateResult.affectedRows);
                    await db.rollback(); // Rollback the test
                    console.log("✅ Test transaction rolled back");
                } catch (updateError) {
                    await db.rollback();
                    if (updateError.message.includes('collected_at')) {
                        console.log("⚠️ collected_at column missing, testing without it:");
                        const [updateResult2] = await db.query(
                            "UPDATE scrapCollection SET approval_status = 'collected', factory_employee_id = ?, factory_notes = ? WHERE id = ?",
                            [1, 'Test collection', collectionId]
                        );
                        console.log("✅ markAsCollected (without collected_at) successful, affected rows:", updateResult2.affectedRows);
                    } else {
                        throw updateError;
                    }
                }
            } else {
                console.log("ℹ️ No pending collections found to test with");
            }
        } catch (error) {
            console.log("❌ markAsCollected test failed:", error.message);
        }

        // Test 8: Check factory user exists
        console.log("\n6️⃣ Checking factory user:");
        try {
            const [factoryUsers] = await db.query("SELECT id, name, role FROM users WHERE role = 'factory'");
            if (factoryUsers.length > 0) {
                console.log("✅ Factory users found:", factoryUsers.map(u => `${u.name} (ID: ${u.id})`).join(', '));
            } else {
                console.log("❌ No factory users found");
            }
        } catch (error) {
            console.log("❌ Factory user check failed:", error.message);
        }

        console.log("\n🎉 Factory API test completed!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        if (db) {
            await db.end();
        }
    }
}

testFactoryAPI();