import mongoose from "mongoose";

/**
 * Schema representing a user in the application.
 *
 * @typedef {Object} User
 * @property {String} googleId - The unique identifier for the user from Google.
 * @property {String} displayName - The name displayed for the user.
 * @property {String} email - The email address of the user.
 * @property {String} [picture] - The URL of the user's profile picture (optional).
 * @property {Date} date - The date and time when the user was created (defaults to the current date).
 */

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  picture: { type: String },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
