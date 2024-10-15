import { createTheme } from "@mui/material/styles";
import backgroundImage from "../assets/owlwatch1.png"; // Example path for background image
import logoImage from "../assets/logo.png"; // Example path for logo image

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
          border: "none", // No border
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#262525", // Change background on hover
            color: "#f1f1f1", // Optionally change text color on hover
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
          border: "none", // No border
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#262525", // Change background on hover
            color: "#f1f1f1", // Optionally change text color on hover
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
          fontSize: "14px", // Adjust font size as needed
          fontWeight: "1000",
          flexWrap: "wrap",
        },
        primary: {
          fontSize: "16px", // Customize primary text size
          fontWeight: "bolder", // Primary text font weight
        },
        secondary: {
          fontSize: "8px", // Customize secondary text size
          color: "#775c2c",
          fontWeight: "bold", // Secondary text font weight
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
          fontWeight: "bold", // Label font weight
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
          backgroundImage: `url(${backgroundImage})`, // Set global background image
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
          color: "#f1f1f1", // Primary color for AppBar
          "& img": {
            content: `url(${logoImage})`, // Set logo image in AppBar
            height: "40px", // Adjust size of the logo
            marginRight: "10px",
          },
        },
      },
    },
  },
});

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
          border: "none", // No border
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#f1f1f1", // Change background on hover
            color: "#262525", // Optionally change text color on hover
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
          border: "none", // No border
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#f1f1f1", // Change background on hover
            color: "#262525", // Optionally change text color on hover
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
          fontSize: "14px", // Adjust font size as needed
          fontWeight: "1000",
          flexWrap: "wrap",
        },
        primary: {
          fontSize: "16px", // Customize primary text size
          fontWeight: "bolder", // Primary text font weight
        },
        secondary: {
          fontSize: "8px", // Customize secondary text size
          color: "#1976d2",
          fontWeight: "bold", // Secondary text font weight
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

const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,        // Reduced offset for smoother entry
    scale: 0.7,   // Slight scale for more subtlety
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,  // Increased duration for smoother appearance
      ease: "easeInOut", // Smooth easing function
    },
  },
  exit: {
    opacity: 0,
    y: 20,        // Smaller offset for smoother exit
    scale: 0.9,
    transition: {
      duration: 0.2,  // Slightly faster exit for responsiveness
      ease: "easeInOut", // Consistent easing for both entry and exit
    },
  },
};

const pageTransition = {
  type: "tween",   // Use 'tween' for smoother transition
  ease: "easeInOut",  // A natural, smooth easing curve
  duration: 0.5,      // Adjust to match the 'animate' transition
};


export { lightTheme, darkTheme, pageVariants, pageTransition };
