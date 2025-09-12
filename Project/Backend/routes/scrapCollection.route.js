import { addCollection,getCollections} from "../controllers/scrapCollection.controller.js";
import express from "express";

const router = express.Router();

router.post("/add", addCollection);
router.get("/get", getCollections);

export default router;