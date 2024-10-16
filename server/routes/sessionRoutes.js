// /routes/sessionRoutes.js
import express from "express";
import {
  saveSession,
  getSessions,
  deleteSession,
} from "../controllers/sessionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
/**
 * @module sessionRoutes
 * @description Express router for session management routes.
 */

router.post("/save", authMiddleware, saveSession);
router.get("/", authMiddleware, getSessions);
router.delete("/:id", authMiddleware, deleteSession);

export default router;
