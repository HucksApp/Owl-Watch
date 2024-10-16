import React, { useContext, useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import Floating from "../components/Floating.js";
import Navbar from "../components/Navbar.js";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CssBaseline } from "@mui/material";
import { pageVariants, pageTransition } from "../styles/theme.js";

/**
 * Dashboard Component
 *
 * A dashboard interface for authenticated users to manage their tabs and sessions.
 * Displays user information and provides navigation options through a responsive
 * navigation bar. Uses animations for smooth transitions between routes.
 *
 * @component
 * @example
 * // Usage example:
 * import Dashboard from './Dashboard';
 *
 * const App = () => (
 *   <Dashboard />
 * );
 *
 * @param {Object} props - Component props.
 * @param {function} props.toggleTheme - Function to toggle the application's theme (dark/light mode).
 * @param {boolean} props.isDarkMode - Boolean indicating whether the dark mode is currently active.
 *
 * @returns {JSX.Element} A container for the dashboard layout, user information, and navigation.
 *
 * @description
 * The Dashboard component serves as the main interface for users who have logged in.
 * It includes a navigation bar, a welcome message, and supports routing through the
 * React Router's `Outlet` component for rendering nested routes.
 *
 * ### Features:
 * - Displays a welcome message with the user's display name.
 * - Contains a responsive navigation bar that allows users to log out and toggle between themes.
 * - Utilizes Framer Motion for page transition animations between different routes.
 *
 * ### Context:
 * - **AuthContext**: Consumes the authentication context to access the current user's information and the logout function.
 *
 * ### State:
 * - `showAppBar` (boolean): State indicating whether the app bar is shown or hidden.
 *
 * ### Usage:
 * - The component checks if a user is logged in; if not, it prompts the user to log in.
 * - The component handles the display of a floating action button to toggle the app bar's visibility.
 */

const Dashboard = ({ toggleTheme, isDarkMode }) => {
  const [showAppBar, setShowAppBar] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleAppBar = () => {
    setShowAppBar((prev) => !prev);
  };

  if (!user) {
    return (
      <Typography variant="h6">Please log in to manage your tabs.</Typography>
    );
  }

  return (
    <Container sx={{ width: "100%" }}>
      <CssBaseline />
      <Navbar
        handleLogout={logout}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        showAppBar={showAppBar}
        toggleAppBar={toggleAppBar}
      />
      <div>
        <Typography variant="h4">Welcome, {user.displayName}</Typography>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      <Floating toggleAppBar={toggleAppBar} showAppBar={showAppBar} />
    </Container>
  );
};

export default Dashboard;
