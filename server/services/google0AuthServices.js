import passport from 'passport';
import {GoogleStrategy} from 'passport-google-oauth20';
import User from'../models/userModel.js';  // User model



passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // Create a new user
            user = new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                picture: profile.photos[0].value
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
}));

export default passport;