import Session from "../models/sessionModel.js";

/**
 * Module for managing user sessions.
 *
 * This module provides functions to handle the saving, retrieving, and deleting
 * of user session data related to browser tabs. Each session is associated with
 * a user and contains a list of tabs and a name for easy identification.
 *
 * @module sessionController
 */

/**
 * Saves a session of tabs for the authenticated user.
 *
 * This function creates a new session in the database with the provided tabs and
 * name, associating it with the currently authenticated user.
 *
 * @async
 * @function
 * @param {Object} req - The request object containing the session data in the body.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Responds with the created session or an error message.
 */
export const saveSession = async (req, res) => {
  console.log("in save ");
  const { tabs, name } = req.body;
  try {
    let session = new Session({
      user: req.user.id,
      tabs,
      name,
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: "Failed to save session", error });
  }
};

/**
 * Retrieves all sessions for the authenticated user.
 *
 * This function fetches all session records associated with the currently authenticated user
 * and returns them in the response.
 *
 * @async
 * @function
 * @param {Object} req - The request object containing user information.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Responds with an array of sessions or an error message.
 */
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sessions", error });
  }
};

/**
 * Deletes a specific session by its ID.
 *
 * This function removes a session from the database using the provided session ID.
 *
 * @async
 * @function
 * @param {Object} req - The request object containing the session ID in the parameters.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Responds with a success message or an error message.
 */
export const deleteSession = async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete session", error });
  }
};
