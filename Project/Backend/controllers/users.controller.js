import bcrypt from 'bcrypt';
import { adduser, getUserByMobile, getUsers, deleteUser, getUserById } from '../models/users.model.js';
import { validateEmail, validateMobile, validatePassword } from '../middleware/validation.middleware.js';

export async function registerUser(req, res) {
    const { name, email, mobile_No, address, role, password } = req.body;
    try {
        if (!name || !email || !mobile_No || !address || !role || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        
        // Validate mobile number
        if (!validateMobile(mobile_No)) {
            return res.status(400).json({ error: "Mobile number must be 10-15 digits" });
        }
        
        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.message });
        }
        
        // Validate role
        const validRoles = ['admin', 'agent', 'factory', 'call_agent'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be one of: " + validRoles.join(', ') });
        }
        
        // Hash password before storing
        const hashPassword = await bcrypt.hash(password, 12);

        const userId = await adduser(req.db, { name, email, mobile_No, address, role, password: hashPassword });
        res.status(201).json({ success: true, message: "User registered successfully", userId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "User with this mobile number already exists" });
        }
        console.error("Error in registerUser:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function loginUser(req, res) {
    const { mobile_No, password } = req.body;
    try {
        if (!mobile_No || !password) {
            return res.status(400).json({ error: "Mobile number and password are required" });
        }

        // Get user by mobile number
        const user = await getUserByMobile(req.db, mobile_No);
        if (!user) {
            return res.status(401).json({ error: "Invalid mobile number or password" });
        }

        // Compare password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid mobile number or password" });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({ 
            message: "Login successful", 
            user: userWithoutPassword 
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await getUsers(req.db);
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Error fetching users" });
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