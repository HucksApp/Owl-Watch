import express from "express";
import {
  googleLogin,
  googleCallback,
  logout,
} from "../controllers/authController.js";

const router = express.Router();
/**
 * @module AuthRoutes
 * @description Express router for handling authentication routes, specifically for Google OAuth.
 */

router.post("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/logout", logout);

export default router;
