import http from "http";
import app from "./app.js";
import allRoutes from "./debug/debug.js";
//import config from "config";


const server = http.createServer(app);
/**
 * @module server
 *
 * The main entry point for the application that creates the HTTP server
 * and initializes the Express app. This module handles server setup
 * and configuration.
 */

/**
 * Debugging: Log all accessible routes in development mode.
 *
 * If the application is running in development mode, this will log
 * all the routes that are accessible within the app.
 */


if (process.env.STAGE  === "development") allRoutes(app);
/**
 * Start the HTTP server and listen on the specified port.
 *
 * @function
 * @param {number} PORT - The port number on which the server will listen.
 * @example
 * // Example log message upon successful server startup
 * console.log(`Server running on port ${PORT}`);
 */
const PORT = process.env.SERVER_PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
