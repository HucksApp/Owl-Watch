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
  const { tabs, name } = req.body;
  try {
    let session = new Session({
      user: req.user.id,
      tabs,
      name,
    });

    const p =await session.save();
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



/**
 * Moves a tab from one session to another.
 *
 * @async
 * @function
 * @param {Object} req - The request object containing the source session ID, target session ID, and tab object.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Responds with the updated sessions or an error message.
 */
export const moveTabBetweenSessions = async (req, res) => {
  const { sourceSessionId, targetSessionId, tab } = req.body;

  try {
    // Find source session and remove the tab
    const sourceSession = await Session.findById(sourceSessionId);
    if (!sourceSession) {
      return res.status(404).json({ message: "Source session not found" });
    }
    sourceSession.tabs = sourceSession.tabs.filter(
      (t) => t.url !== tab.url
    );
    await sourceSession.save();

    // Find target session and add the tab
    const targetSession = await Session.findById(targetSessionId);
    if (!targetSession) {
      return res.status(404).json({ message: "Target session not found" });
    }
    targetSession.tabs.push(tab);
    await targetSession.save();
    res.status(200).json({ sourceSession, targetSession });
  } catch (error) {
    res.status(500).json({ message: "Failed to move tab between sessions", error });
  }
};



/**
 * Merges one session into another.
 *
 * This function appends the tabs from the source session to the target session and deletes the source session.
 *
 * @async
 * @function
 * @param {Object} req - The request object containing the source and target session IDs.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Responds with the updated target session or an error message.
 */
export const removeTabFromSession = async (req, res) => {
  const { sessionId, tabId } = req.body;

  try {
    // Find the session by ID and remove the tab by tabId
    const session = await Session.findById(sessionId);
    session.tabs = session.tabs.filter((tab) => tab.id !== tabId);

    // Save the updated session
    await session.save();
    res.status(200).send(session);
  } catch (error) {
    res.status(500).send({ message: 'Error removing tab from session' });
  }
};


/**
 * Reorders the tabs within a session.
 *
 * This function updates the order of tabs in a session based on the reordered list provided.
 *
 * @async
 * @function
 * @param {Object} req - The request object containing the session ID and reordered tabs.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Responds with the updated session or an error message.
 */
export const reorderSessionTabs = async (req, res) => {
  const { sessionId, reorderedTabs } = req.body;
  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Replace current tabs with reordered tabs
    session.tabs = reorderedTabs;
    await session.save();
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Failed to reorder tabs", error });
  }
};
