// /routes/sessionRoutes.js
import express from "express";
import {
  saveSession,
  getSessions,
  deleteSession,
  moveTabBetweenSessions,
  removeTabFromSession,
  reorderSessionTabs,
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
router.put("/move-tab", moveTabBetweenSessions);
router.put("/remove-tab", removeTabFromSession);
router.put("/reorder-tabs", reorderSessionTabs);

export default router;
