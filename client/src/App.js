import "./styles/App.css";
import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import TabManager from "./components/TabManager";
import SessionManager from "./components/SessionManager";
import QuickActions from "./components/QuickActions";
import TabGroups from "./components/TabGroups.js";
import LazyLoader from "./components/LazyLoader.js";
import Login from "./pages/Login";
import Watch from "./components/Watcher.js";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "./styles/theme.js";
import { AnimatePresence, motion } from "framer-motion";
import { pageVariants } from "./styles/theme.js";
import { VoiceCommandProvider } from "./contexts/VoiceCommandContext.js";
import { CommandStructureProvider } from "./contexts/CommandStructureContext.js";
import {
  saveToLocalStorage,
  getFromLocalStorage,
} from "./services/localStorage.js";

/**
 * Main application component that handles routing, theme management, and context providers.
 *
 * @returns {JSX.Element} The rendered application.
 */

const App = () => {
  /**
   * State to manage the current theme (dark/light mode).
   * @type {[boolean, function]}
   */
  const [isDarkMode, setIsDarkMode] = useState(false);

  /**
   * Toggles the theme between dark and light mode and saves the preference in local storage.
   *
   * @returns {void}
   */
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    // Save the updated theme preference to local storage
    saveToLocalStorage("theme", newTheme ? "dark" : "light");
  };

  /**
   * Effect to fetch the saved theme preference from local storage on component mount.
   * Updates the isDarkMode state based on the saved preference.
   *
   * @returns {void}
   */
  useEffect(() => {
    const fetchTheme = async () => {
      const savedTheme = await getFromLocalStorage("theme");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      } else {
        setIsDarkMode(false);
      }
    };
    fetchTheme();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CommandStructureProvider>
          <VoiceCommandProvider>
            <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
              <CssBaseline />
              <AnimatePresence mode="wait">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <motion.div
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={pageVariants}
                      >
                        <Login
                          toggleTheme={toggleTheme}
                          isDarkMode={isDarkMode}
                        />
                      </motion.div>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <motion.div
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={pageVariants}
                      >
                        <Dashboard
                          toggleTheme={toggleTheme}
                          isDarkMode={isDarkMode}
                        />
                      </motion.div>
                    }
                  >
                    <Route path="watcher" element={<Watch />} />

                    <Route path="save" element={<SessionManager />} />

                    <Route path="tabs" element={<TabManager />} />
                    <Route path="lazyloader" element={<LazyLoader />} />

                    <Route path="quick_actions" element={<QuickActions />} />
                    <Route path="Tabgroups" element={<TabGroups />} />
                  </Route>
                </Routes>
              </AnimatePresence>
            </ThemeProvider>
          </VoiceCommandProvider>
        </CommandStructureProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
