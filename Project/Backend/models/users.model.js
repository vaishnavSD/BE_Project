export async function adduser(db, {name,email,mobile_No,address,role,password}) {
    const [result] = await db.query(
        "INSERT INTO users (name,email,mobile_No,address,role,password) VALUES (?, ?, ?, ?, ?, ?)",
        [name,email,mobile_No,address,role,password]
    );
    return result.insertId;
}

export async function getUserByMobile(db, mobile_No) {
    const [rows] = await db.query(
        "SELECT id, name, email, mobile_No, address, role, password FROM users WHERE mobile_No = ?",
        [mobile_No]
    );
    return rows[0];
}

export async function getUsers(db) {
    const [rows] = await db.query("SELECT * FROM users where role!='admin' ORDER BY id DESC");
    return rows;
}

// Get factory employees
export async function getFactoryEmployees(db) {
    const [rows] = await db.query("SELECT * FROM users WHERE role = 'factory' ORDER BY id DESC");
    return rows;
}

// Get user by ID
export async function getUserById(db, id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
}

// Delete user
export async function deleteUser(db, id) {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows;
}