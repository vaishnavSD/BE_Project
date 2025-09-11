import bcrypt from 'bcrypt';
import { adduser,login } from '../models/users.model.js';

export async function registerUser(req, res) {
    const { name, email, mobile_No, address, role, password } = req.body;
    try {
        if ( !name || !email || !mobile_No || !address || !role || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        //bcrypt password
        //const hashPassword = await bcrypt.hash(password, 10);
        //const hashPassword = await bcrypt.hash(password, 10);

        const userId = await adduser(req.db, { name, email, mobile_No, address, role, password });
        res.status(201).json({ message: "User registered successfully", userId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY'){
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