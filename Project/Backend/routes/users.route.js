import express from 'express';

import { registerUser, loginUser, getAllUsers, deleteUserById } from '../controllers/users.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.delete('/:id', deleteUserById);

export default router;