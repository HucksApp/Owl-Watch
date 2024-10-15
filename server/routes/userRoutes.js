// /routes/sessionRoutes.js
import express from 'express';
import { getUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';



const router = express.Router();
// Protect routes with auth middleware

router.get('/',authMiddleware, getUser);

export default router;