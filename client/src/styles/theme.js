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
      main: "#212529",     //"#1976d2",
    },
    secondary: {
      main: "#495057"//"#F8F9FA ",
    },
    background: {
      default:  "6C757D",//"#E9ECEF ",
      paper: "#f4f6f8",
    },
    text: {
      primary:  "#212529", //"#333333",
      secondary: "#495057",//"#666666",
      fontWeight:"bolder"
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontWeight:1000,
    h1: {
      fontSize: "2.5rem",
      backgroundColor: "#6C757D"//"#f1f1f1",
    },
    h2: {
      fontSize: "2rem",
      backgroundColor: "#6C757D" //"#f1f1f1",
    },
    h4: {
      color:  "#6C757D"//"#775c2c",
    },
    h5: {
      color:  "#6C757D"//"#1976d2",
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
          backgroundColor: "#007BFF",//"#7209b7",
          color:  "#212529",//"#f1f1f1",
          border: "none",
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#6610F2",//"#262525",
            color: "#212529",//"#f1f1f1",
            opacity: "0.6",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          textTransform: "0.2s",
          backgroundColor:  "#007BFF",//"#7209b7",
          color:  "#212529",//"#f1f1f1",
          border: "none",
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#6610F2", //"#262525",
            color:  "#212529",//"#f1f1f1",
            opacity: "0.6",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(242,242,242, 0.7)",
          fontWeight: "1000",
          boxSizing: "border-box",
          // width: "100%",
          // outline:"blue solid 10px",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          display: "flex",
          justifyContent:"center",
          alignItems:"flex-start",
          flexDirection:"column",
          // fontSize: "14px",
          overflow:"auto",
          fontWeight: "1000",
          // flexWrap: "wrap",
          // overflow: "hidden",
          // boxSizing: "border-box",
           width: "inherit"
        },
        primary: {
          fontSize: "14px",
          fontWeight: "bolder",
        },
        secondary: {
          fontSize: "8px",
          color: "#495057",
          fontWeight: "bold",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(242,242,242, 0.7)",
          fontWeight: "1000",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(242,242,242, 0.7)",
          fontWeight: "1000",
        },
      },
    },
    MuiFormGroup: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(242,242,242, 0.7)",
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
          backgroundColor:"#F8F9FA",
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
      main: "#121212",//"#90caf9",
    },
    secondary: {
      main:   "#1E1E1E"//"#f48fb1",
    },
    background: {
      default: "#2C2C2C",//"#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary:   "#B3B3B3",//"#ffffff",
      secondary:  "#8A8A8A" //"#bbbbbb",
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
          backgroundColor: "#61AFFF",//"#7209b7",
          color: "#E1E1E1",
          border: "none",
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#9B7EFA",
            color:  "#FFD369",//"#262525",
            opacity: "0.6",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          textTransform: "0.2s",
          backgroundColor: "#61AFFF",//"#7209b7",
          color:  "#E1E1E1",//"#f1f1f1",
          border: "none",
          fontWeight: "1000",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#f1f1f1",
            color:  "#FFD369",//"#262525",
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
          color: "#E1E1E1",
        },
        secondary: {
          fontSize: "8px",
          color: "#B3B3B3",//"#1976d2",
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
    //scale: 0.9,
  },
  animate: {
    opacity: 1,
    x: 0,
    //scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    //scale: 0.9,
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
