import bcrypt from 'bcrypt';
import { adduser, login, getUsers, deleteUser, getUserById } from '../models/users.model.js';

export async function registerUser(req, res) {
    const { name, email, mobile_No, address, role, password } = req.body;
    try {
        if (!name || !email || !mobile_No || !address || !role || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        //bcrypt password
        //const hashPassword = await bcrypt.hash(password, 10);
        //const hashPassword = await bcrypt.hash(password, 10);

        const userId = await adduser(req.db, { name, email, mobile_No, address, role, password });
        res.status(201).json({ message: "User registered successfully", userId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "User with this mobile number already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function loginUser(req, res) {
    const { mobile_No, password } = req.body;
    try {
        if (!mobile_No || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = await login(req.db, { mobile_No, password });
        if (!user) {
            return res.status(401).json({ error: "Invalid mobile number or password" });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await getUsers(req.db);
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error fetching users" });
    }
}

export async function deleteUserById(req, res) {
    console.log("📥 Received request to delete user");
    console.log("Request params:", req.params);

    const { id } = req.params;

    try {
        // Check if user exists
        const existingUser = await getUserById(req.db, id);
        if (!existingUser) {
            console.log("❌ User not found");
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent deletion of admin users
        if (existingUser.role === 'admin') {
            console.log("❌ Cannot delete admin user");
            return res.status(403).json({ error: "Cannot delete admin user" });
        }

        const affectedRows = await deleteUser(req.db, id);

        if (affectedRows === 0) {
            console.log("❌ No rows affected");
            return res.status(404).json({ error: "User not found" });
        }

        console.log("✅ User deleted successfully");
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.log("❌ Error in deleteUser:", error);
        res.status(500).json({ error: "Error deleting user" });
    }
}