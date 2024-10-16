import React, { createContext, useState, useEffect } from "react";
import axios from "../services/api";
import {
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  clearLocalStorage,
} from "../services/localStorage";
import { useNavigate } from "react-router-dom";

/* global chrome */

/**
 * AuthProvider Component
 *
 * A context provider component for managing user authentication using Google OAuth.
 * This component handles login, logout, and user session management while interacting
 * with a backend API for authentication.
 *
 * @component
 * @example
 * // Usage example:
 * import { AuthProvider } from './contexts/AuthContext';
 *
 * const App = () => (
 *   <AuthProvider>
 *     <YourComponent />
 *   </AuthProvider>
 * );
 *
 * @returns {JSX.Element} A context provider for authentication state and actions.
 *
 * @description
 * The AuthProvider component uses React's Context API to provide authentication-related
 * state and methods to its children components. It handles Google OAuth login, stores
 * and retrieves user tokens from local storage, and manages user session state.
 *
 * ## Key Features:
 * - Fetches user information from the backend on initial load.
 * - Opens a pop-up window for Google OAuth login and processes the response.
 * - Stores user tokens in local storage and provides methods to log in and log out.
 * - Clears user data from local storage upon logout.
 *
 * ### State:
 * - `user`: The currently authenticated user object.
 * - `token`: The authentication token for the logged-in user.
 *
 * ### Methods:
 * - `login()`: Initiates the login process by opening the Google OAuth window.
 * - `logout()`: Logs the user out and clears stored authentication data.
 */

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const googleAuthURL = process.env.REACT_APP_GOOGLE_AUTH;
  const authScope = process.env.REACT_APP_GOOGLE_AUTH_SCOPE;
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const redirectUri = `${process.env.REACT_APP_API_BASE_URL}/api/auth/google/callback`;
  console.log(BASE_URL);

  useEffect(() => {
    // Check if the user is already logged in
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    getFromLocalStorage("token").then((token) => {
      if (token) {
        fetchUser();
      }
    });
  }, [token]);

  const handleAuthResponse = async (token) => {
    if (token) {
      console.log("Extracted ID Token:", token);

      try {
        const response = await axios.post(`${BASE_URL}/api/auth/google`, {
          token,
        });
        setToken(response.data);
        saveToLocalStorage("token", response.data);
      } catch (error) {
        console.error("Error sending token to backend:", error);
      }
    } else {
      console.error("ID token not found");
    }
  };

  // Update the part where you open the auth window and check for the response
  const login = async () => {
    const nonce = [...Array(30)]
      .map(() => Math.floor(Math.random() * 36).toString(36))
      .join("");

    const authURL = `${googleAuthURL}?client_id=${clientId}&response_type=id_token&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${authScope}&nonce=${nonce}`;
    console.log(`auth url ===> ${authURL}`, `redirect ===>${redirectUri}`);

    const authWindow = window.open(
      authURL,
      "authWindow",
      "width=600,height=600"
    );
    console.log("====> In login, auth window opened");

    // Add an event listener to listen for messages from the OAuth window
    window.addEventListener("message", (event) => {
      console.log("Received message:", event);

      // Check the origin of the message
      if (event.origin !== BASE_URL) {
        console.error("Untrusted origin:", event.origin);
        return;
      }
      console.log("====> Message received from trusted origin");

      if (event.data && event.data.type === "auth_response") {
        const token = event.data.token;
        console.log(token, "====> token");
        handleAuthResponse(token);

        // Close the auth window
        if (authWindow) {
          //authWindow.close();
        }
      }
    });

    // Check if the auth window opened successfully
    if (!authWindow) {
      console.error(
        "Failed to open OAuth window. Please check your popup blocker settings."
      );
    }
  };

  const logout = async () => {
    await axios.get(`${BASE_URL}/api/auth/logout`);
    removeFromLocalStorage("token");
    removeFromLocalStorage("owl_watch_session");
    removeFromLocalStorage("theme");
    clearLocalStorage();
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//   https://paejibbeefdfbfccdhbloigdghcjnckg.chromiumapp.org/
