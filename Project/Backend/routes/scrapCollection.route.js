import { addCollection, getCollections, getAgentCollections } from "../controllers/scrapCollection.controller.js";
import express from "express";

const router = express.Router();

router.post("/add", addCollection);
router.get("/get", getCollections);
router.get("/agent/:agent_MobileNo", getAgentCollections);

export default router;