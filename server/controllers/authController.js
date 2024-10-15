import config from 'config'
import { OAuth2Client } from 'google-auth-library';
import User from '../models/userModel.js';
import path from 'path';
import { fileURLToPath } from 'url'; // Import necessary module for __dirname workaround

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google OAuth callback
export const googleCallback = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'page', 'auth.html')); // Ensure correct file path
};


export const googleLogin = async (req, res) => {
  const client = new OAuth2Client(config.get('GOOGLE_CLIENT_ID'));
  const { token } = req.body; // Get the token from query params
  console.log(token)

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.get('GOOGLE_CLIENT_ID'),
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

    // Log the user in using Passport.js
    req.logIn(user, (err) => {
      if (err) {
        console.error('Error logging in user:', err);
        return res.redirect(`${config.get('Client_Base_Url')}/login`); // Redirect to login on error
      }

      res.status(200).json({ token });
    });
  } catch (err) {
    console.error('Error during Google token verification:', err);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};





export const logout = (req, res) => {
  console.log("here")
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Could not log out');
        }
        res.status(200).json({message: "logout"});
    });
};
