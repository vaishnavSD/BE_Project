import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mysql from "mysql2/promise";

import scrapDetailsRouter from "./routes/scrapDetails.route.js";
import userRequestRouter from "./routes/userRequest.route.js";

// Load env variables
dotenv.config({ path: "C:/Users/DELL/OneDrive/Desktop/BE Project/Project/env.env" });

const app = express();
const port = process.env.PORT || 3000;

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===== MySQL connection =====
let db;
try {
  db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
  });
  console.log("✅ MySQL connected");
} catch (error) {
  console.error("❌ MySQL connection error:", error.message);
  process.exit(1);
}

// Make DB available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ===== Routes =====
app.use("/api/scrapDetails", scrapDetailsRouter);
app.use("/api/userRequests", userRequestRouter);

// ===== Start Server =====
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
