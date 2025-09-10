import express from 'express';
import { UserDetails } from '../models/userDetails.model.js';

import { addUserDetails,getUserDetails } from '../controllers/userDetails.controller.js';
const router = express.Router();

router.post("/add", addUserDetails);
router.get("/", getUserDetails);

export default router;
