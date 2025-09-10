import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import scrapDetailsRouter from "./routes/scrapDetails.route.js";
import userDetailsRouter from "./routes/userDetails.route.js";

// Load environment variables
dotenv.config({ path: "C:/Users/DELL/OneDrive/Desktop/BE Project/website/env.env" });

const app = express();
const port = process.env.PORT || 3000;
const mongoURL = process.env.Mongo_URL;

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
   // tempFileDir: "/tmp/",
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL ,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ===== MongoDB connection =====
try {
  await mongoose.connect(mongoURL);
  console.log("MongoDB connected");
} catch (error) {
  console.error("MongoDB connection error:", error);
}

// ===== Routes =====
app.use("/api/scrapDetails", scrapDetailsRouter);
app.use("/api/userDetails", userDetailsRouter);

// ===== Cloudinary configuration =====
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

// ===== Start Server =====
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
