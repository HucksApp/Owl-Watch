import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { Fab, Slide } from "@mui/material";
import Draggable from "react-draggable";

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
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = () => {
    setIsDragging(true);
  };

  const handleStop = () => {
    // Timeout to reset isDragging after drag has completed
    setTimeout(() => setIsDragging(false), 0);
  };

  const handleClick = () => {
    if (!isDragging) {
      toggleAppBar();
    }
  };

  return (
    <Slide direction="right" in={!showAppBar} mountOnEnter unmountOnExit>
      <div style={{ position: "fixed", top: 20, left: 20 }}>
        {" "}
        <Draggable onDrag={handleDrag} onStop={handleStop}>
          <Fab
            aria-label="menu"
            size="small"
            onClick={handleClick}
            style={{ cursor: "grab" }}
          >
            <MenuIcon sx={{ fontWeight: "1000" }} />
          </Fab>
        </Draggable>
      </div>
    </Slide>
  );
};

export default Floating;
