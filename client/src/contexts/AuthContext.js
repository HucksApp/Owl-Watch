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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BASE_URL =
    process.env.REACT_APP_STAGE === "production"
      ? process.env.REACT_APP_API_BASE_URL_PROD
      : process.env.REACT_APP_API_BASE_URL_DEV;
  const redirectUri = `${BASE_URL}/api/auth/google/callback`;

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== BASE_URL) {
        console.log('Received message from:', event.origin);
        console.log('Message content:', event.data);
        console.error("Untrusted origin:", event.origin);
        return;
      }
      console.log('Received message from:', event.origin);
      console.log('Message content:', event.data);
      console.error("Untrusted origin:", event.origin);
  
      if (event.data && event.data.type === "auth_response") {
        const token = event.data.token;
        handleAuthResponse(token);
      }
    };
  
    window.addEventListener("message", handleMessage);
  
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []); // Runs once on component mount

  
  useEffect(() => {
    // Check if the user is already logged in
    const fetchUser = async () => {
      setLoading(true);
      try {
        const owl_user = await getFromLocalStorage("OWL_WATCH_USER");
        if (owl_user) {
          setUser(owl_user);
        } else {
          const response = await axios.get(`${BASE_URL}/api/user`, {
            withCredentials: true,
          });
          saveToLocalStorage("OWL_WATCH_USER", response.data);
          console.log(response.data)
          setUser(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // Ensure loading is updated
      }
    };
    fetchUser();
  }, [token]);



  const handleAuthResponse = async (token) => {
    if (token) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/google`, {
          token,
        });
        setToken(response.data);
        saveToLocalStorage("OWL_WATCH_TOKEN", response.data);
  
        // Fetch user data immediately after login
        const userResponse = await axios.get(`${BASE_URL}/api/user`, {
          withCredentials: true,
        });
  
        saveToLocalStorage("OWL_WATCH_USER", userResponse.data);
        setUser(userResponse.data);
        
      } catch (error) {
        console.error("Error sending token to backend:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after processing
      }
    } else {
      console.error("ID token not found");
      setLoading(false);
    }
  };


  const login = async () => {
    setLoading(true);
    try {
      const nonce = [...Array(30)]
        .map(() => Math.floor(Math.random() * 36).toString(36))
        .join("");
  
      const authURL = `${googleAuthURL}?client_id=${clientId}&response_type=id_token&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${authScope}&nonce=${nonce}`;
  
      const authWindow = window.open(
        authURL,
        "authWindow",
        "width=600,height=600"
      );
  
      if (!authWindow) {
        console.error("Failed to open OAuth window. Please check your popup blocker settings.");
        return;
      }
  
      const checkPopup = setInterval(() => {
        try {
          if (!authWindow || authWindow.closed) {
            clearInterval(checkPopup);
            setLoading(false);
          }
        } catch (error) {
          console.error("Popup check error:", error);
        }
      }, 500);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  

  const logout = async () => {
    setLoading(true);
    try {
      await axios.get(`${BASE_URL}/api/auth/logout`);
      removeFromLocalStorage("OWL_WATCH_TOKEN");
      removeFromLocalStorage("owl_watch_session");
      removeFromLocalStorage("OWL_WATCH_USER");
      removeFromLocalStorage("theme");
      clearLocalStorage();
      setUser(null);
      setToken(null); // Ensure token is cleared
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
