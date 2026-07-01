import express from 'express';

import { logIn } from '../controllers/userController.js';
import { createGroup, getGroups } from '../controllers/groupController.js';

import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post("/auth/login", logIn);
router.post("/groups", auth, createGroup);
router.get("/groups", auth, getGroups);

export default router;