import { scrapCollection,scrapData,getAllScrapCollection } from "../models/scrapCollecction.model.js";

function generateCollectionId() {
  // Example: COLL-20250911-123 (prefix + date + random number)
  const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
  const random = Math.floor(100 + Math.random() * 900); // 3-digit random number
  return `COLL-${date}-${random}`;
}


export const addCollection = async (req, res) => {
    const {agentname,agent_MobileNo,customername,customer_MobileNo,customerEmail,address,totalamount,paymentstatus,scrapItems} = req.body;
    try {
        if (!agentname || !agent_MobileNo || !customername || !customer_MobileNo || !customerEmail || !address || !totalamount || !paymentstatus||scrapItems.length===0) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const id = generateCollectionId();
        const result = await scrapCollection(req.db, {id:id,agentname,agent_MobileNo,customername,customer_MobileNo,customerEmail,address,totalamount,paymentstatus});

        for (const item of scrapItems) {
            const { category, type, weight, price, subtotal } = item;
            await scrapData(req.db, { id:id, category, type, weight, price, subtotal });
        }

        res.status(201).json({ message: "Collection added successfully", data: result });
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