import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import dotenv from 'dotenv';
dotenv.config();
/**
 * Initializes Passport authentication strategies.
 *
 * This module configures Passport to use the Google OAuth 2.0 strategy for user authentication.
 * It defines how user data is retrieved from Google and stored in the application's database.
 *
 * @module passportConfig
 */



console.log()
passport.use(
  
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.Google_Callback_URL,
    },
    /**
     * Callback function to handle user authentication.
     *
     * @function
     * @async
     * @param {string} accessToken - The access token granted by Google.
     * @param {string} refreshToken - The refresh token granted by Google.
     * @param {Object} profile - The authenticated user's profile information.
     * @param {function} done - The callback function to indicate success or failure.
     * @returns {void} Calls the done function with either an error or the user object.
     */

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/**
 * Serializes the user instance into the session.
 *
 * This function is used to store the user's ID in the session after successful authentication.
 *
 * @function
 * @param {Object} user - The authenticated user object.
 * @param {function} done - The callback function to indicate success.
 * @returns {void} Calls the done function with the user ID.
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserializes the user from the session.
 *
 * This function is used to retrieve the user instance from the database using the user ID stored in the session.
 *
 * @function
 * @param {string} id - The ID of the user to be deserialized.
 * @param {function} done - The callback function to indicate success or failure.
 * @returns {void} Calls the done function with either an error or the user object.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
