import { scrapCollection,scrapData,getAllScrapCollection } from "../models/scrapCollecction.model.js";

function generateCollectionId() {
  // Example: COLL-20250911-123 (prefix + date + random number)
  const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
  const random = Math.floor(100 + Math.random() * 900); // 3-digit random number
  return `COLL-${date}-${random}`;
}


export const addCollection = async (req, res) => {
    const {agentname,agent_MobileNo,customername,customer_MobileNo,customerEmail,address,totalamount,paymentstatus,scrapItems,dateTime} = req.body;
    try {
        if (!agentname || !agent_MobileNo || !customername || !customer_MobileNo || !customerEmail || !address || !totalamount || !paymentstatus||scrapItems.length===0) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const id = generateCollectionId();
        
        // Handle datetime - convert from frontend format to MySQL format
        let dateNtime;
        if (dateTime) {
            // Frontend sends datetime-local format, treat it as local time
            // Convert to MySQL datetime format without timezone conversion
            const date = new Date(dateTime);
            // Format as YYYY-MM-DD HH:MM:SS in local timezone
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            dateNtime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } else {
            // Use current local datetime if not provided
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            dateNtime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        
        console.log("Collection datetime:", dateNtime);
        
        const result = await scrapCollection(req.db, {
            id: id,
            agentname,
            agent_MobileNo,
            customername,
            customer_MobileNo,
            customerEmail,
            address,
            totalamount,
            paymentstatus,
            dateNtime
        });

        for (const item of scrapItems) {
            const { category, type, weight, price, subtotal } = item;
            await scrapData(req.db, { id:id, category, type, weight, price, subtotal });
        }

        res.status(201).json({ 
            message: "Collection added successfully", 
            data: { ...result, id, dateNtime } 
        });
    } catch (error) {
        console.error("Error adding collection:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getCollections = async (req, res) => {
    try {
        const collections = await getAllScrapCollection(req.db);
        res.status(200).json({ data: collections });
    } catch (error) {
        console.error("Error fetching collections:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAgentCollections = async (req, res) => {
    const { agent_MobileNo } = req.params;
    try {
        if (!agent_MobileNo) {
            return res.status(400).json({ message: "Agent mobile number is required" });
        }
        
        const [collections] = await req.db.query(
            "SELECT * FROM scrapCollection WHERE agent_MobileNo = ?",
            [agent_MobileNo]
        );
        
        res.status(200).json({ data: collections });
    } catch (error) {
        console.error("Error fetching agent collections:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};