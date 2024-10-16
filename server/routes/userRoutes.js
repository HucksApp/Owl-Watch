// /routes/sessionRoutes.js
import express from "express";
import { getUser } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
/**
 * @module sessionRoutes
 *
 * This module handles session-related routes for user management,
 * including fetching user details. The routes are protected by authentication middleware.
 */

router.get("/", authMiddleware, getUser);

export default router;
