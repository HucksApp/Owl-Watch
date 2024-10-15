// app.js
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors'
import bodyParser from 'body-parser';
import WebSocket from 'ws';
import path from 'path';
import { fileURLToPath } from 'url'; 

// Environment Config
import config from 'config'
import passport  from './auth/passport.js';
// Import Routes
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import userRoutes from './routes/userRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();

console.log(config.get("Client_Base_Url"),"client====>")
// Middleware

app.use('/static',express.static(path.join(__dirname, 'page')))

app.use(cors({
  origin: config.get("Client_Base_Url"),
  credentials: true, // This is important for allowing cookies to be sent with requests
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Api health check */
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello Owl Watch on Guard' });
});


// Setup Sessions
app.use(session({
    secret: config.get( "GOOGLE_CLIENT_SECRET"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 2, // Session expiration time 2days
      sameSite: 'lax'  
    }
}));



// Initialize Passport for Google OAuth
app.use(passport.initialize());
app.use(passport.session());
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/user', userRoutes);

// Connect to MongoDB
console.log(config.get('mongoURI'))
mongoose.connect(config.get('mongoURI'), {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

export default app;