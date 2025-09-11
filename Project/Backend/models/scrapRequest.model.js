//Add new user request 

export async function addUserRequest(db, { name, mobile_No, address, email, pickUp_Date, time_slot, description, status,id }) {
  const [result] = await db.query(
    "INSERT INTO userRequest (name,mobile_No,address,email,pickUp_Date,time_slot,description,status,id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      mobile_No,
      address,
      email,
      pickUp_Date,
      time_slot,
      description,
      status,
      id
      ]
  );
  return result.insertId;
}

// display all user requests and update status

export async function getAllUserRequests(db) {
  const [rows] = await db.query("SELECT * FROM userRequest");
  return rows;
}
