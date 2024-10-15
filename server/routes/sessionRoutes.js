// /routes/sessionRoutes.js
import express from 'express';
import {saveSession, getSessions, deleteSession} from '../controllers/sessionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
// Protect routes with auth middleware

router.post('/save', authMiddleware, saveSession);
router.get('/', authMiddleware, getSessions);
router.delete('/:id', authMiddleware, deleteSession);

export default router;