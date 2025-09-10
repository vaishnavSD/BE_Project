import express from "express";
import { addDetails, getDetails, deleteDetails,updatePrice} from "../controllers/scrapDetails.controller.js";

const router = express.Router();

router.post("/add", addDetails);
router.get("/get", getDetails);
router.delete("/delete/:type", deleteDetails);
router.put("/update/:type", updatePrice);


export default router;
