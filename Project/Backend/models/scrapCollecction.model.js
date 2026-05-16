// schema to add collection by agent

export async function scrapCollection(db, {id,agentname,agent_MobileNo,customername,customer_MobileNo,customerEmail,address,totalamount,paymentstatus,dateNtime}) {
    try {
        // Try to insert with factory columns first
        const [result] = await db.query(
            "INSERT INTO scrapCollection (id, agentname, agent_MobileNo, customername, customer_MobileNo, customerEmail, address, totalamount, paymentstatus, dateNtime, approval_status, factory_employee_id, factory_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NULL)",
            [id, agentname, agent_MobileNo, customername, customer_MobileNo, customerEmail, address, totalamount, paymentstatus, dateNtime]
        );
        return result;
    } catch (error) {
        // If factory columns don't exist, insert without them
        if (error.message.includes('approval_status') || error.message.includes('factory_employee_id')) {
            console.log("Factory columns not found, inserting without them");
            const [result] = await db.query(
                "INSERT INTO scrapCollection (id, agentname, agent_MobileNo, customername, customer_MobileNo, customerEmail, address, totalamount, paymentstatus, dateNtime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [id, agentname, agent_MobileNo, customername, customer_MobileNo, customerEmail, address, totalamount, paymentstatus, dateNtime]
            );
            return result;
        }
        throw error;
    }
}
export async function scrapData(db, {id,category,type,weight,price,subtotal}) {
    const [result] = await db.query(
        "INSERT INTO scrapData (id, category, type, weight, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)",
        [id, category, type, weight, price, subtotal]
    );
    return result;
}
export async function getAllScrapCollection(db) {
    const [collections] = await db.query("SELECT * FROM scrapCollection");
    const [scrapData] = await db.query("SELECT * FROM scrapData");

    // Group scrapData by collection id
    const scrapDataById = {};
    for (const item of scrapData) {
        if (!scrapDataById[item.id]) scrapDataById[item.id] = [];
        scrapDataById[item.id].push(item);
    }

    // Attach scrapData array to each collection
    return collections.map(col => ({
        ...col,
        scrapItems: scrapDataById[col.id] || []
    }));
}

// Get collections pending factory approval
export async function getPendingCollections(db) {
    const [collections] = await db.query("SELECT * FROM scrapCollection WHERE approval_status = 'pending' ORDER BY dateNtime DESC");
    const [scrapData] = await db.query("SELECT * FROM scrapData");

    // Group scrapData by collection id
    const scrapDataById = {};
    for (const item of scrapData) {
        if (!scrapDataById[item.id]) scrapDataById[item.id] = [];
        scrapDataById[item.id].push(item);
    }

    // Attach scrapData array to each collection
    return collections.map(col => ({
        ...col,
        scrapItems: scrapDataById[col.id] || []
    }));
}

// Mark collection as collected by factory
export async function markAsCollected(db, {collectionId, factoryEmployeeId, notes}) {
    try {
        // Try to update with collected_at column first
        const [result] = await db.query(
            "UPDATE scrapCollection SET approval_status = 'collected', factory_employee_id = ?, factory_notes = ?, collected_at = NOW() WHERE id = ?",
            [factoryEmployeeId, notes, collectionId]
        );
        return result;
    } catch (error) {
        // If collected_at column doesn't exist, update without it
        if (error.message.includes('collected_at')) {
            console.log("collected_at column not found, updating without it");
            const [result] = await db.query(
                "UPDATE scrapCollection SET approval_status = 'collected', factory_employee_id = ?, factory_notes = ? WHERE id = ?",
                [factoryEmployeeId, notes, collectionId]
            );
            return result;
        }
        throw error;
    }
}

// Get collection by ID with full details
export async function getCollectionById(db, id) {
    const [collections] = await db.query("SELECT * FROM scrapCollection WHERE id = ?", [id]);
    const [scrapData] = await db.query("SELECT * FROM scrapData WHERE id = ?", [id]);
    
    if (collections.length === 0) return null;
    
    return {
        ...collections[0],
        scrapItems: scrapData
    };
}