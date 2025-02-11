import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Retrieves the authenticated user's information.
 * 
 * This function checks if there is a user logged in and returns the user object.
 * If there is no authenticated user, it responds with a 401 Unauthorized status
 * and an appropriate error message.
 * 
 * @async
 * @function
 * @param {Object} req - The request object containing user authentication data.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {void} Responds with the user object or a 401 error message if no user is authenticated.
 */

export const getUser = async (req, res) => {
  if (req.user) {
      res.json(req.user);
  } else {
      res.status(401).json({ message: 'No User' });
  }
};



export const getPolicy = async (req, res) => {
      res.sendFile(path.join(__dirname, "..", "page", "policy.html"));
};

