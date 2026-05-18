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
import factoryRouter from "./routes/factory.route.js";
import { autoMigrate } from "./utils/migration.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware.js";

// Load env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ===== Middleware =====
// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} from ${req.ip}`);
  next();
});

app.use(express.json());
app.use(cookieParser());

// CORS configuration - restrict in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:8081'];

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-User-Id", "X-User-Role"],
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
  
  // Run auto-migration for factory features
  await autoMigrate(db);
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
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use("/api/scrapDetails", scrapDetailsRouter);
app.use("/api/userRequests", userRequestRouter);
app.use("/api/user", userRouter);
app.use("/api/collection", collectionRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/factory", factoryRouter);

// ===== Error Handling =====
// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// ===== Start Server =====
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`💻 Local access: http://localhost:${port}/api`);
  console.log(`🌐 Network access: http://0.0.0.0:${port}/api`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (db) {
    await db.end();
    console.log('Database connection closed');
  }
  process.exit(0);
});
