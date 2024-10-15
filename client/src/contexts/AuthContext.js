import React, { createContext, useState, useEffect } from 'react';
import axios from '../services/api';
import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage, clearLocalStorage } from '../services/localStorage';
import { useNavigate } from "react-router-dom";

/* global chrome */ 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const googleAuthURL = process.env.REACT_APP_GOOGLE_AUTH;
  const authScope = process.env.REACT_APP_GOOGLE_AUTH_SCOPE;
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL
  const redirectUri = `${process.env.REACT_APP_API_BASE_URL}/api/auth/google/callback`;
  console.log(BASE_URL);

  useEffect(() => {
    // Check if the user is already logged in
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user`, { withCredentials: true });
        console.log(response.data, "=====>data")
        setUser(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    getFromLocalStorage('token').then((token) => {
      if (token) {
        fetchUser();
      }
  });
    
  }, [token]);




  const handleAuthResponse = async (token) => {
    if (token) {
      console.log("Extracted ID Token:", token);
  
      // Send the token to your backend using axios
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/google`, { token });
        console.log(`${BASE_URL}/api/auth/google`);
        const data = response.data; // Directly use axios response
        console.log("Login Response:", data);
        // Handle successful login, update state, or redirect, etc.
        //setUser(data.user); // Assuming the response contains user info
        setToken(response.data)
        saveToLocalStorage('token', response.data);
      } catch (error) {
        console.error("Error sending token to backend:", error);
      }
    } else {
      console.error("ID token not found");
    }
  };

  
  
// Update the part where you open the auth window and check for the response
const login = async () => {
  // Generate a nonce (optional, for additional security)
  const nonce = [...Array(30)]
    .map(() => Math.floor(Math.random() * 36).toString(36))
    .join('');

  // Build the authentication URL
  const authURL = `${googleAuthURL}?client_id=${clientId}&response_type=id_token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${authScope}&nonce=${nonce}`;
  console.log(`auth url ===> ${authURL}`, `redirect ===>${redirectUri}`);

  // Open the OAuth URL in a new window
  const authWindow = window.open(authURL, 'authWindow', 'width=600,height=600');
  console.log("====> In login, auth window opened");

  // Add an event listener to listen for messages from the OAuth window
  window.addEventListener('message', (event) => {
    console.log('Received message:', event); // Log received messages for debugging

    // Check the origin of the message
    if (event.origin !== BASE_URL) {
      console.error('Untrusted origin:', event.origin);
      return;
    }
    console.log("====> Message received from trusted origin");

    // Handle the message containing the token
    if (event.data && event.data.type === 'auth_response') {
      const token = event.data.token;
      console.log(token, "====> token");
      handleAuthResponse(token); // Call the function to process the token

      // Close the auth window
      if (authWindow) {
        //authWindow.close();
      }
    }
  });

  // Check if the auth window opened successfully
  if (!authWindow) {
    console.error('Failed to open OAuth window. Please check your popup blocker settings.');
  }
};



  const logout = async () => {
    await axios.get(`${BASE_URL}/api/auth/logout`);
    removeFromLocalStorage('token')
    removeFromLocalStorage('owl_watch_session')
    removeFromLocalStorage('theme')
    clearLocalStorage()
    setUser(null);
    navigate("/")
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//   https://paejibbeefdfbfccdhbloigdghcjnckg.chromiumapp.org/
