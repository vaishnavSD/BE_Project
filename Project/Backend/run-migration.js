import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load env variables
dotenv.config({ path: './env.env' });

async function runMigration() {
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

        // First, let's see the current state of the table
        console.log("🔍 Checking current table structure...");
        const [columns] = await db.query("SHOW COLUMNS FROM scrapCollection WHERE Field = 'approval_status'");
        
        if (columns.length > 0) {
            console.log("Current approval_status column:", columns[0]);
        }

        // Check if approval_status column exists
        if (columns.length === 0) {
            console.log("🔄 Adding factory columns...");
            // Add factory approval columns with all possible values initially
            await db.query(`
                ALTER TABLE scrapCollection 
                ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'collected') DEFAULT 'pending',
                ADD COLUMN factory_employee_id INT NULL,
                ADD COLUMN factory_notes TEXT NULL,
                ADD COLUMN collected_at TIMESTAMP NULL,
                ADD INDEX idx_approval_status (approval_status),
                ADD INDEX idx_factory_employee (factory_employee_id)
            `);
            console.log("✅ Factory columns added");
        } else {
            console.log("✅ Factory columns already exist");
            
            // Check current enum values
            const enumValues = columns[0].Type;
            console.log("Current enum values:", enumValues);
            
            if (!enumValues.includes('collected')) {
                console.log("🔄 Adding 'collected' to enum...");
                
                // First, add 'collected' to the existing enum without removing other values
                try {
                    await db.query(`
                        ALTER TABLE scrapCollection 
                        MODIFY COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'collected') DEFAULT 'pending'
                    `);
                    console.log("✅ Added 'collected' to enum");
                } catch (error) {
                    console.error("Error adding 'collected' to enum:", error.message);
                }
            }
            
            // Check if collected_at column exists
            const [collectedAtColumns] = await db.query("SHOW COLUMNS FROM scrapCollection WHERE Field = 'collected_at'");
            if (collectedAtColumns.length === 0) {
                console.log("🔄 Adding collected_at column...");
                await db.query(`
                    ALTER TABLE scrapCollection 
                    ADD COLUMN collected_at TIMESTAMP NULL DEFAULT NULL
                `);
                console.log("✅ collected_at column added");
            }
        }

        // Add foreign key constraint if it doesn't exist
        try {
            const [constraints] = await db.query(`
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_NAME = 'scrapCollection' 
                AND CONSTRAINT_NAME = 'fk_factory_employee'
            `);
            
            if (constraints.length === 0) {
                await db.query(`
                    ALTER TABLE scrapCollection 
                    ADD CONSTRAINT fk_factory_employee 
                    FOREIGN KEY (factory_employee_id) REFERENCES users(id) ON DELETE SET NULL
                `);
                console.log("✅ Foreign key constraint added");
            } else {
                console.log("✅ Foreign key constraint already exists");
            }
        } catch (error) {
            console.log("Foreign key constraint issue (may be ok):", error.message);
        }

        // Update existing collections to have pending status
        const [updateResult] = await db.query("UPDATE scrapCollection SET approval_status = 'pending' WHERE approval_status IS NULL");
        console.log(`✅ Updated ${updateResult.affectedRows} collections to pending status`);

        // Add sample factory user if not exists
        try {
            const [existingFactory] = await db.query("SELECT id FROM users WHERE role = 'factory' LIMIT 1");
            if (existingFactory.length === 0) {
                await db.query(`
                    INSERT INTO users (name, email, mobile_No, address, role, password) 
                    VALUES ('Factory Manager', 'factory@scrapwale.com', '9876543210', 'Factory Address', 'factory', 'factory123')
                `);
                console.log("✅ Sample factory user created");
            } else {
                console.log("✅ Factory user already exists");
            }
        } catch (error) {
            console.log("Could not create factory user:", error.message);
        }

        // Final check - show the current enum values
        const [finalColumns] = await db.query("SHOW COLUMNS FROM scrapCollection WHERE Field = 'approval_status'");
        if (finalColumns.length > 0) {
            console.log("✅ Final approval_status enum:", finalColumns[0].Type);
        }

        console.log("🎉 Migration completed successfully!");

    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        if (db) {
            await db.end();
        }
    }
}

runMigration();