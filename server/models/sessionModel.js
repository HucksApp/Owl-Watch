import mongoose from "mongoose";

/**
 * Schema representing a tab in a browser session.
 *
 * @typedef {Object} Tab
 * @property {String} url - The URL of the tab.
 * @property {String} title - The title of the webpage associated with the tab.
 * @property {Boolean} active - Indicates whether the tab is currently active.
 * @property {Date} lastAccessed - The date and time when the tab was last accessed.
 */
const TabSchema = new mongoose.Schema({
  url: String,
  title: String,
  active: Boolean,
  lastAccessed: Date,
});

/**
 * Schema representing a user session containing multiple tabs.
 *
 * @typedef {Object} Session
 * @property {mongoose.Schema.Types.ObjectId} user - Reference to the User model, indicating which user the session belongs to.
 * @property {String} name - The name of the session.
 * @property {Tab[]} tabs - An array of Tab objects representing the tabs opened in this session.
 * @property {Date} createdAt - The date and time when the session was created.
 * @property {Date} updatedAt - The date and time when the session was last updated.
 */

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, // Added the 'name' field here
  tabs: [TabSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.model("Session", SessionSchema);
