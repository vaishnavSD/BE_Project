//Add new user request 

export async function addUserRequest(db, { name, mobile_No, address, email, pickUp_Date, time_slot, description, status }) {
  const [result] = await db.query(
    "INSERT INTO userRequest (name, mobile_No, address, email, pickUp_Date, time_slot, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      mobile_No,
      address,
      email,
      pickUp_Date,
      time_slot,
      description,
      status
    ]
  );
  return result.insertId;
}

// display all user requests and update status

export async function getAllUserRequests(db) {
  const [rows] = await db.query("SELECT * FROM userRequest ORDER BY id DESC");
  return rows;
}

// Update user request status
export async function updateUserRequestStatus(db, id, status) {
  const [result] = await db.query(
    "UPDATE userRequest SET status = ? WHERE id = ?",
    [status, id]
  );
  return result.affectedRows;
}

// Delete user request
export async function deleteUserRequest(db, id) {
  const [result] = await db.query("DELETE FROM userRequest WHERE id = ?", [id]);
  return result.affectedRows;
}

// Get user request by ID
export async function getUserRequestById(db, id) {
  const [rows] = await db.query("SELECT * FROM userRequest WHERE id = ?", [id]);
  return rows[0];
}
