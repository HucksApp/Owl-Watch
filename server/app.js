// app.js
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import MongoStore from 'connect-mongo';
// Environment Config
//import config from "config";
import passport from "./auth/passport.js";
// Routes
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h3bmy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&tls=true&appName=Cluster0`


// Initialize Express
const app = express();

/**
 * @module app
 *
 * The main application module that sets up the Express server,
 * configures middleware, defines routes, and connects to the MongoDB database.
 */

/**
 * Middleware configuration for static files, CORS, body parsing, and sessions.
 *
 * - Uses CORS to allow requests from the specified client base URL.
 * - Parses incoming request bodies in JSON and URL-encoded formats.
 * - Initializes session management using express-session with a defined secret and options.
 */

app.use("/static", express.static(path.join(__dirname, "page")));
app.use(
  cors({
    origin: [
      process.env.BASE_UI_DEV,
      process.env.BASE_UI_PROD,
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "page", "home.html"));
});



/**
 * Health check endpoint.
 *
 * @name GET /api/hello
 * @function
 * @returns {Object} 200 - A message confirming the server is running.
 * @example
 * // Request
 * GET /api/hello
 *
 * // Response
 * {
 *   "message": "Hello Owl Watch on Guard"
 * }
 */


app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello Owl Watch on Guard" });
});

// Setup Sessions
app.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: URI,
      collectionName: 'sessions-store',
      ttl: 60 * 60 * 24 * 7, // 7 days TTL in seconds
    }),
    cookie: {
      secure: false, // Only true in production
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
      sameSite: 'lax'
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/**
 * API Routes configuration.
 *
 * The following routes are set up:
 * - /api/auth for authentication-related actions.
 * - /api/session for session management.
 * - /api/user for user-related actions.
 */
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/user", userRoutes);

// Connect to MongoDB
//console.log(config.get("mongoURI"));
mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

export default app;
