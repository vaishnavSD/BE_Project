// MySQL model functions for scrapDetails

// Get all scrap details
export async function getAllScrapDetails(db) {
  const [rows] = await db.query("SELECT * FROM scrapDetails");
  return rows;
}

// Add a new scrap detail
export async function addScrapDetail(db, { category, type, price }) {
  const [result] = await db.query(
    "INSERT INTO scrapDetails (category, type, price) VALUES (?, ?, ?)",
    [category, type, price]
  );
  return result.insertId;
}

// Get scrap detail by ID

export async function getScrapDetailById(db, id) {
  const [rows] = await db.query("SELECT * FROM scrapDetails WHERE id = ?", [id]);
  return rows[0];
}

// Update scrap detail

// Update only the price for a given type
export async function updatePriceByType(db, type, price) {
  const [result] = await db.query(
    "UPDATE scrapDetails SET price = ? WHERE type = ?",
    [price, type]
  );
  return result.affectedRows;
}

// Delete scrap detail
export async function deleteScrapDetail(db, type) {
  const [result] = await db.query("DELETE FROM scrapDetails WHERE type = ?", [type]);
  return result.affectedRows;
}