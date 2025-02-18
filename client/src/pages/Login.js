import React, { useContext, useEffect } from "react";
import { Button, Container, Typography, CircularProgress, Box} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ContrastIcon from "@mui/icons-material/Contrast";
import GoogleIcon from "@mui/icons-material/Google";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import { getFromLocalStorage } from "../services/localStorage";
/**
 * Login Component
 *
 * A user authentication interface that allows users to log in using their Google account.
 * It also provides an option to switch between light and dark themes.
 *
 * @component
 * @example
 * // Usage example:
 * import Login from './Login';
 *
 * const App = () => (
 *   <Login />
 * );
 *
 * @param {Object} props - Component props.
 * @param {function} props.toggleTheme - Function to toggle the application's theme (dark/light mode).
 * @param {boolean} props.isDarkMode - Boolean indicating whether the dark mode is currently active.
 *
 * @returns {JSX.Element} A container with a login form, theme toggle button, and Google login button.
 *
 * @description
 * The Login component provides a simple interface for users to authenticate themselves
 * through Google login. It also includes a button to switch the app's theme.
 *
 * ### Features:
 * - Provides a button for toggling between light and dark themes.
 * - Offers a button for logging in with Google.
 * - Automatically redirects users to the dashboard if they are already logged in.
 *
 * ### Context:
 * - **AuthContext**: Consumes the authentication context to access the login function and the current user state.
 *
 * ### Effects:
 * - Uses the `useEffect` hook to navigate to the dashboard if the user is already authenticated.
 *
 * ### State:
 * - The component does not manage its own state but relies on context for user authentication status.
 */

const Login = ({ toggleTheme, isDarkMode }) => {
  const { login, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  console.log("loading",loading);

  useEffect(() => {
    const handleUserView = async () => {
      const viewPath = await getFromLocalStorage("currentView");
      if (viewPath) {
        navigate(viewPath);
      } else {
        navigate("/dashboard/tabs");
      }
    };

    if (user) {
       handleUserView();
    }
  }, [user]);

  return (
    <Container sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Login to Owl Watch
      </Typography>
      {loading ? (<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
          <CircularProgress size={60} sx={{ marginBottom: "20px" }} />
          <Typography variant="body2" sx={{ textAlign: "center", display: "flex", alignItems: "center", gap: "5px",fontSize: '1.2em', fontWeight: 800 }}>
            <LockPersonIcon sx={{ fontSize: 24, color:"red" }} /> Do not close the window until credentials is verified.
          </Typography>
        </Box>
      ) :
        (<>
        <Button
        variant="contained"
        onClick={toggleTheme}
        startIcon={
          isDarkMode ? (
            <ContrastIcon sx={{ fontWeight: "1000" }} />
          ) : (
            <DarkModeIcon sx={{ fontWeight: "1000" }} />
          )
        }
        sx={{ marginBottom: "5px" }}
      >
        Switch to {isDarkMode ? "Light" : "Dark"} Mode
      </Button>

      <Button variant="contained" onClick={login} startIcon={<GoogleIcon />}>
        Login with Google
      </Button>
      </>)
      }
    </Container>
  );
};

export default Login;
