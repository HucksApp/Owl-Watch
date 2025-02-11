import { OAuth2Client } from "google-auth-library";
import User from "../models/userModel.js";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Module for handling Google OAuth authentication.
 *
 * This module contains functions to manage Google OAuth authentication, including:
 * 1. Serving the Google OAuth callback page.
 * 2. Logging in a user with Google OAuth tokens.
 * 3. Logging out the current user.
 *
 * It integrates with the Google OAuth2 client and uses a MongoDB user model to store user
 * information. Upon successful authentication, it creates a user if one does not exist.
 *
 * @module AuthController
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Handles the Google OAuth callback by serving the authentication HTML page.
 *
 * @function
 * @param {Object} req - The request object from the client.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Sends the auth.html file to the client.
 */
export const googleCallback = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "page", "auth.html"));
};

/**
 * Authenticates a user using a Google OAuth token.
 *
 * This function verifies the provided ID token from Google, checks if the user exists
 * in the database, and if not, creates a new user. Upon successful authentication,
 * it logs the user in and responds with a success message.
 *
 * @async
 * @function
 * @param {Object} req - The request object containing the token in the body.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Responds with a success message and token or an error message.
 */
export const googleLogin = async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let user = await User.findOne({ googleId: payload.sub });

    // If the user does not exist, create a new one
    if (!user) {
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        displayName: payload.name,
        picture: payload.picture,
      });
      await user.save();
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Error logging in user:", err);
        return res.redirect(`${process.env.Client_Base_Url}/login`); // Redirect to login on error
      }

      res.status(200).json({ token });
    });
  } catch (err) {
    console.error("Error during Google token verification:", err);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

/**
 * Logs out the current user.
 *
 * This function handles user logout, invalidating the session and responding with a
 * success message.
 *
 * @function
 * @param {Object} req - The request object containing the user's session.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Responds with a success message or an error message on failure.
 */

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Could not log out");
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error("Session destroy error:", sessionErr);
        return res.status(500).send("Could not destroy session");
      }

      res.status(200).json({ message: "Logout successful" });
    });
  });
};
