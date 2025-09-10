import express from "express";
import { ScrapDetails } from "../models/scrapDetails.model.js";
import { addDetails, getDetails, deleteDetails } from "../controllers/scrapDetails.controller.js";

const router = express.Router();

router.post("/add", addDetails);
router.get("/get", getDetails);
router.delete("/delete/:id", deleteDetails);

export default router;
