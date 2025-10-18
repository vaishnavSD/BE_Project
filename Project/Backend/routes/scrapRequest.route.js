import express from 'express';

import { addRequest, getRequests, updateRequest, deleteRequest } from '../controllers/scrapRequest.controller.js';
const router = express.Router();

router.post("/add", addRequest);
router.get("/get", getRequests);
router.put("/:id", updateRequest);
router.delete("/:id", deleteRequest);

export default router;
