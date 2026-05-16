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

// Update user request with call agent details
export async function updateRequestWithCallAgent(db, id, status, callAgentId, callAgentNotes) {
  const [result] = await db.query(
    "UPDATE userRequest SET status = ?, call_agent_id = ?, call_agent_notes = ?, call_approved_at = NOW() WHERE id = ?",
    [status, callAgentId, callAgentNotes, id]
  );
  return result.affectedRows;
}

// Update user request with agent acceptance
export async function acceptRequestByAgent(db, id, agentId) {
  const [result] = await db.query(
    "UPDATE userRequest SET status = 'Accepted by Agent', accepted_agent_id = ?, agent_accepted_at = NOW() WHERE id = ?",
    [agentId, id]
  );
  return result.affectedRows;
}

// Get requests approved by call agent (for agent dashboard)
export async function getCallAgentApprovedRequests(db) {
  const [rows] = await db.query(
    "SELECT * FROM userRequest WHERE status = 'Call Agent Approved' ORDER BY call_approved_at DESC"
  );
  return rows;
}

// Get requests by call agent
export async function getRequestsByCallAgent(db, callAgentId) {
  const [rows] = await db.query(
    "SELECT * FROM userRequest WHERE call_agent_id = ? ORDER BY id DESC",
    [callAgentId]
  );
  return rows;
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

// Get requests accepted by a specific agent (pending pickups)
export async function getAcceptedRequestsByAgent(db, agentId) {
  const [rows] = await db.query(
    "SELECT * FROM userRequest WHERE accepted_agent_id = ? AND status = 'Accepted by Agent' ORDER BY agent_accepted_at DESC",
    [agentId]
  );
  return rows;
}

// Mark request as collected by agent
export async function markRequestAsCollected(db, id, agentId) {
  const [result] = await db.query(
    "UPDATE userRequest SET status = 'Collected', collected_at = NOW() WHERE id = ? AND accepted_agent_id = ?",
    [id, agentId]
  );
  return result.affectedRows;
}
