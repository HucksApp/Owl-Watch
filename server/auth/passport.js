import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';  // Assume you have a User model to store user info
import config from 'config';




//console.log(config.get( "GOOGLE_CLIENT_SECRET"), config.get( "GOOGLE_CLIENT_ID"), "=======>hereee")
passport.use(
  new GoogleStrategy(
    {
      clientID: config.get( "GOOGLE_CLIENT_ID"),      // Get this from Google Developer Console
      clientSecret:  config.get( "GOOGLE_CLIENT_SECRET"), // From Google Developer Console
      callbackURL:  config.get('Google_Callback_URL'),       // The callback route defined in your application
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile, "profile ========<<<<<<")
      try {
        // Find or create user in the database based on Google profile info
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
          });
          console.log(user, "user ========<<<<<<")
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize and deserialize user (for session handling)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
