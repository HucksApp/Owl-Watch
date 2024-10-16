import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";

/**
 * The main entry point of the React application.
 *
 * This file is responsible for rendering the root component of the application
 * into the DOM. It wraps the application in React's StrictMode to highlight
 * potential problems in an application. The styles for the application are
 * also imported here.
 *
 * @module index
 * @returns {void}
 */

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
