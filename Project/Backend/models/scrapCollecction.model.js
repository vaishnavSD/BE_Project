// schema to add collection by agent

export async function scrapCollection(db, {id,agentname,agent_MobileNo,customername,customer_MobileNo,customerEmail,address,totalamount,paymentstatus}) {
    const [result] = await db.query(
        "INSERT INTO scrapCollection (id, agentname, agent_MobileNo, customername, customer_MobileNo, customerEmail, address, totalamount, paymentstatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, agentname, agent_MobileNo, customername, customer_MobileNo, customerEmail, address, totalamount, paymentstatus]
    );
    return result;
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