import express from 'express';

import { addRequest,getRequests } from '../controllers/scrapRequest.controller.js';
const router = express.Router();

router.post("/add", addRequest);
router.get("/get", getRequests);

export default router;
