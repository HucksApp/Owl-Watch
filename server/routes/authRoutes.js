import express from 'express';
import { googleLogin, googleCallback, logout } from '../controllers/authController.js';

const router = express.Router();
// Google OAuth Routes
router.post('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/logout', logout);

export default router;