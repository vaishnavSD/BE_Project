// Simple migration utility to check and run factory migrations

export async function checkFactoryMigration(db) {
    try {
        // Check if approval_status column exists
        const [columns] = await db.query("SHOW COLUMNS FROM scrapCollection LIKE 'approval_status'");
        return columns.length > 0;
    } catch (error) {
        console.error("Error checking migration status:", error);
        return false;
    }
}

export async function runFactoryMigration(db) {
    try {
        console.log("🔄 Running factory migration...");
        
        // Add factory approval columns
        await db.query(`
            ALTER TABLE scrapCollection 
            ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'collected') DEFAULT 'pending',
            ADD COLUMN factory_employee_id INT NULL,
            ADD COLUMN factory_notes TEXT NULL,
            ADD COLUMN approved_at TIMESTAMP NULL,
            ADD COLUMN rejected_at TIMESTAMP NULL,
            ADD COLUMN collected_at TIMESTAMP NULL,
            ADD INDEX idx_approval_status (approval_status),
            ADD INDEX idx_factory_employee (factory_employee_id)
        `);

        // Add foreign key constraint
        await db.query(`
            ALTER TABLE scrapCollection 
            ADD CONSTRAINT fk_factory_employee 
            FOREIGN KEY (factory_employee_id) REFERENCES users(id) ON DELETE SET NULL
        `);

        // Update existing collections to have pending status
        await db.query("UPDATE scrapCollection SET approval_status = 'pending' WHERE approval_status IS NULL");

        // Add sample factory user if not exists
        const [existingFactory] = await db.query("SELECT id FROM users WHERE role = 'factory' LIMIT 1");
        if (existingFactory.length === 0) {
            await db.query(`
                INSERT INTO users (name, email, mobile_No, address, role, password) 
                VALUES ('Factory Manager', 'factory@scrapwale.com', '9876543210', 'Factory Address', 'factory', 'factory123')
            `);
            console.log("✅ Sample factory user created");
        }

        console.log("✅ Factory migration completed successfully");
        return true;
    } catch (error) {
        console.error("❌ Factory migration failed:", error);
        return false;
    }
}

export async function checkCallAgentMigration(db) {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM userRequest LIKE 'call_agent_id'");
        return columns.length > 0;
    } catch (error) {
        console.error("Error checking call agent migration status:", error);
        return false;
    }
}

export async function runCallAgentMigration(db) {
    try {
        console.log("🔄 Running call agent migration...");
        
        await db.query(`
            ALTER TABLE userRequest 
            ADD COLUMN call_agent_id INT NULL,
            ADD COLUMN call_agent_notes TEXT NULL,
            ADD COLUMN call_approved_at DATETIME NULL,
            ADD COLUMN accepted_agent_id INT NULL,
            ADD COLUMN agent_accepted_at DATETIME NULL
        `);

        await db.query(`
            ALTER TABLE userRequest 
            ADD CONSTRAINT fk_call_agent 
            FOREIGN KEY (call_agent_id) REFERENCES users(id) ON DELETE SET NULL
        `);

        await db.query(`
            ALTER TABLE userRequest 
            ADD CONSTRAINT fk_accepted_agent 
            FOREIGN KEY (accepted_agent_id) REFERENCES users(id) ON DELETE SET NULL
        `);

        console.log("✅ Call agent migration completed successfully");
        return true;
    } catch (error) {
        console.error("❌ Call agent migration failed:", error);
        return false;
    }
}

export async function checkStatusColumnMigration(db) {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM userRequest WHERE Field = 'status'");
        if (columns.length > 0) {
            const statusColumn = columns[0];
            // Check if the column is still varchar(10)
            return !statusColumn.Type.includes('varchar(10)');
        }
        return false;
    } catch (error) {
        console.error("Error checking status column migration:", error);
        return false;
    }
}

export async function runStatusColumnMigration(db) {
    try {
        console.log("🔄 Running status column migration...");
        
        await db.query(`
            ALTER TABLE userRequest 
            MODIFY COLUMN status VARCHAR(50) NULL
        `);

        console.log("✅ Status column migration completed successfully");
        return true;
    } catch (error) {
        console.error("❌ Status column migration failed:", error);
        return false;
    }
}

export async function checkCollectedStatusMigration(db) {
    try {
        // Check if approval_status enum includes 'collected'
        const [columns] = await db.query("SHOW COLUMNS FROM scrapCollection WHERE Field = 'approval_status'");
        if (columns.length > 0) {
            const enumValues = columns[0].Type;
            return enumValues.includes('collected');
        }
        return false;
    } catch (error) {
        console.error("Error checking collected status migration:", error);
        return false;
    }
}

export async function runCollectedStatusMigration(db) {
    try {
        console.log("🔄 Running collected status migration...");
        
        // First, check if the approval_status column exists at all
        const [columns] = await db.query("SHOW COLUMNS FROM scrapCollection WHERE Field = 'approval_status'");
        
        if (columns.length === 0) {
            console.log("approval_status column doesn't exist, skipping collected status migration");
            return true;
        }

        // Add collected_at column if it doesn't exist
        try {
            await db.query(`
                ALTER TABLE scrapCollection 
                ADD COLUMN collected_at TIMESTAMP NULL DEFAULT NULL
            `);
            console.log("✅ Added collected_at column");
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                console.log("collected_at column already exists");
            } else {
                console.error("Error adding collected_at column:", error.message);
            }
        }

        // Update any existing 'approved' status to 'collected'
        try {
            const [updateResult] = await db.query(`
                UPDATE scrapCollection 
                SET approval_status = 'collected', collected_at = COALESCE(approved_at, NOW()) 
                WHERE approval_status = 'approved'
            `);
            console.log(`✅ Updated ${updateResult.affectedRows} approved collections to collected`);
        } catch (error) {
            console.log("No approved collections to update or error:", error.message);
        }

        // Set rejected collections back to pending
        try {
            const [rejectResult] = await db.query(`
                UPDATE scrapCollection 
                SET approval_status = 'pending', factory_employee_id = NULL, factory_notes = NULL 
                WHERE approval_status = 'rejected'
            `);
            console.log(`✅ Reset ${rejectResult.affectedRows} rejected collections to pending`);
        } catch (error) {
            console.log("No rejected collections to reset or error:", error.message);
        }

        // Finally, update the enum to only include 'pending' and 'collected'
        try {
            await db.query(`
                ALTER TABLE scrapCollection 
                MODIFY COLUMN approval_status ENUM('pending', 'collected') DEFAULT 'pending'
            `);
            console.log("✅ Updated approval_status enum to include only pending and collected");
        } catch (error) {
            console.error("Error updating enum:", error.message);
            // This might fail if there are still 'approved' or 'rejected' values, but that's ok
        }

        console.log("✅ Collected status migration completed successfully");
        return true;
    } catch (error) {
        console.error("❌ Collected status migration failed:", error);
        return false;
    }
}

export async function autoMigrate(db) {
    const factoryMigrationExists = await checkFactoryMigration(db);
    if (!factoryMigrationExists) {
        console.log("🔍 Factory migration not detected, running auto-migration...");
        await runFactoryMigration(db);
    } else {
        console.log("✅ Factory migration already applied");
    }

    const callAgentMigrationExists = await checkCallAgentMigration(db);
    if (!callAgentMigrationExists) {
        console.log("🔍 Call agent migration not detected, running auto-migration...");
        await runCallAgentMigration(db);
    } else {
        console.log("✅ Call agent migration already applied");
    }

    const statusColumnMigrationExists = await checkStatusColumnMigration(db);
    if (!statusColumnMigrationExists) {
        console.log("🔍 Status column migration not detected, running auto-migration...");
        await runStatusColumnMigration(db);
    } else {
        console.log("✅ Status column migration already applied");
    }

    const collectedStatusMigrationExists = await checkCollectedStatusMigration(db);
    if (!collectedStatusMigrationExists) {
        console.log("🔍 Collected status migration not detected, running auto-migration...");
        await runCollectedStatusMigration(db);
    } else {
        console.log("✅ Collected status migration already applied");
    }
    
    return true;
}
