import { getAllScrapDetails, addScrapDetail, deleteScrapDetail } from '../models/scrapDetails.model.js';

export const addDetails = async (req, res) => {
  const { category, type, price } = req.body;
  console.log(category, type, price);

  try {
    // Validate required text fields
    if (!category || !type || !price) {
      return res.status(400).json({ errors: "All fields are required" });
    }

    // Save to database (MySQL)
    const details = { category, type, price };
    const id = await addScrapDetail(req.db, details);
    res.json({
      message: "Scrap detail created successfully",
      id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating scrap detail" });
  }
};

export const getDetails = async (req, res) => {
  try {
    const scrapDetails = await getAllScrapDetails(req.db);
    res.json(scrapDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching scrap details" });
  }
};

export const deleteDetails = async (req, res) => {
  const { type } = req.params;
  try {
    const affectedRows = await deleteScrapDetail(req.db, type);
    if (!affectedRows) {
      return res.status(404).json({ error: "Scrap detail not found" });
    }
    res.json({ message: "Scrap detail deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting scrap detail" });
  }
};

// Update only the price of a scrap detail
export const updatePrice = async (req, res) => {
  const { type } = req.params;
  const { price } = req.body;
  if (!price) {
    return res.status(400).json({ error: "Price is required" });
  }
  try {
    const [result] = await req.db.query(
      "UPDATE scrapDetails SET price = ? WHERE type = ?",
      [price, type]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Scrap detail not found" });
    }
    res.json({ message: "Price updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating price" });
  }
};
