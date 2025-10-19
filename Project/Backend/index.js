import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mysql from "mysql2/promise";

import scrapDetailsRouter from "./routes/scrapDetails.route.js";
import userRequestRouter from "./routes/scrapRequest.route.js";
import userRouter from "./routes/users.route.js";
import collectionRouter from "./routes/scrapCollection.route.js";
import reportsRouter from "./routes/reports.route.js";

// Load env variables
dotenv.config({ path: "./.env" });

const app = express();
const port = process.env.PORT || 5000;

// Debug: Check if env variables are loaded
console.log("🔍 Environment variables check:");
console.log("PORT:", process.env.PORT);
console.log("MYSQL_HOST:", process.env.MYSQL_HOST);
console.log("MYSQL_USER:", process.env.MYSQL_USER);
console.log("MYSQL_DATABASE:", process.env.MYSQL_DATABASE);

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true, // Allow all origins in development
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
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
});

app.use("/api/scrapDetails", scrapDetailsRouter);
app.use("/api/userRequests", userRequestRouter);
app.use("/api/user", userRouter);
app.use("/api/collection", collectionRouter);
app.use("/api/reports", reportsRouter);

// ===== Start Server =====
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📱 Mobile access: http://10.249.247.190:${port}/api`);
  console.log(`💻 Local access: http://localhost:${port}/api`);
  console.log(`🌐 Network access: http://0.0.0.0:${port}/api`);
});
