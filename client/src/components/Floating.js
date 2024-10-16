import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { Fab, Slide } from "@mui/material";

/**
 * Floating Component
 *
 * A floating action button (FAB) that provides a toggle functionality for the AppBar.
 * The button appears on the screen when the AppBar is hidden, allowing users to bring it back into view.
 * Positioned at the bottom-right corner of the screen.
 *
 * @component
 * @example
 * // Usage example:
 * <Floating toggleAppBar={toggleAppBar} showAppBar={false} />
 *
 * @param {Object} props - The component props
 * @param {function} props.toggleAppBar - Function to toggle the visibility of the AppBar
 * @param {boolean} props.showAppBar - Boolean that controls the visibility of the AppBar; the button appears when this is false
 *
 * @returns {JSX.Element} A floating action button that toggles the AppBar's visibility.
 */

const Floating = ({ toggleAppBar, showAppBar }) => {
  return (
    <Slide direction="left" in={!showAppBar} mountOnEnter unmountOnExit>
      <Fab
        aria-label="menu"
        size="small"
        onClick={toggleAppBar}
        style={{ position: "fixed", bottom: 20, right: 20 }} // Floating position
      >
        <MenuIcon sx={{ fontWeight: "1000" }} />
      </Fab>
    </Slide>
  );
};

export default Floating;
