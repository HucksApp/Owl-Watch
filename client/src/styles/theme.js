import { createTheme } from "@mui/material/styles";
import backgroundImage from "../assets/owlwatch1.png";
import logoImage from "../assets/logo.png";

/**
 * Creates the light theme for the application using Material-UI's createTheme.
 *
 * This theme includes customizations for the color palette, typography,
 * and component styles specific to the light mode of the application.
 *
 * @constant {Object} lightTheme
 * @returns {Object} The customized light theme for the application.
 */
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: "2.5rem",
      backgroundColor: "#f1f1f1",
    },
    h2: {
      fontSize: "2rem",
      backgroundColor: "#f1f1f1",
    },
    h4: {
      color: "#775c2c",
    },
    h5: {
      color: "#1976d2",
    },
    body1: {
      fontSize: "1rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "0.2s",
          backgroundColor: "#7209b7",
          color: "#f1f1f1",
          border: "none",
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#262525",
            color: "#f1f1f1",
            opacity: "0.6",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          textTransform: "0.2s",
          backgroundColor: "#7209b7",
          color: "#f1f1f1",
          border: "none",
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#262525",
            color: "#f1f1f1",
            opacity: "0.6",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(241, 241, 241, 0.7)",
          fontWeight: "1000",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          fontWeight: "1000",
          flexWrap: "wrap",
          overflow: "hidden",
        },
        primary: {
          fontSize: "16px",
          fontWeight: "bolder",
        },
        secondary: {
          fontSize: "8px",
          color: "#775c2c",
          fontWeight: "bold",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(241, 241, 241, 0.7)",
          fontWeight: "1000",
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(241, 241, 241, 0.7)",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: "bold",
        },
        shrink: {
          padding: "10px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          color: "#262525",
          fontWeight: "1000",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#262525",
          color: "#f1f1f1",
          "& img": {
            content: `url(${logoImage})`,
            height: "40px",
            marginRight: "10px",
          },
        },
      },
    },
  },
});

/**
 * Creates the dark theme for the application using Material-UI's createTheme.
 *
 * This theme includes customizations for the color palette, typography,
 * and component styles specific to the dark mode of the application.
 *
 * @constant {Object} darkTheme
 * @returns {Object} The customized dark theme for the application.
 */

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#bbbbbb",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: "2.5rem",
    },
    h2: {
      fontSize: "2rem",
    },
    h4: {
      color: "#1976d2",
    },
    body1: {
      fontSize: "1rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "0.2s",
          backgroundColor: "#7209b7",
          color: "#f1f1f1",
          border: "none",
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#f1f1f1",
            color: "#262525",
            opacity: "0.6",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          textTransform: "0.2s",
          backgroundColor: "#7209b7",
          color: "#f1f1f1",
          border: "none",
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#f1f1f1",
            color: "#262525",
            opacity: "0.6",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          backgroundColor: "#262525",
          fontWeight: "1000",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          fontWeight: "1000",
          flexWrap: "wrap",
          overflow: "hidden",
        },
        primary: {
          fontSize: "16px",
          fontWeight: "bolder",
        },
        secondary: {
          fontSize: "8px",
          color: "#1976d2",
          fontWeight: "bold",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          color: "#f1f1f1",
          fontWeight: "1000",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontWeight: "1000",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#f1f1f1",
          color: "#262525",
          "& img": {
            content: `url(${logoImage})`,
            height: "40px",
            marginRight: "10px",
          },
        },
      },
    },
  },
});

/**
 * Animation variants for page transitions within the application.
 *
 * This object defines the initial, animate, and exit states for page
 * animations to create smooth transitions between different views.
 *
 * @constant {Object} pageVariants
 * @returns {Object} The animation variants for page transitions.
 */
const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.7,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

/**
 * Transition configuration for page animations.
 *
 * This object defines the type, ease, and duration of transitions for
 * the page animations, providing a cohesive visual experience.
 *
 * @constant {Object} pageTransition
 * @returns {Object} The transition configuration for page animations.
 */

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.5,
};

export { lightTheme, darkTheme, pageVariants, pageTransition };
