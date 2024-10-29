import React from "react";
import { Box, Tooltip } from "@mui/material";

// Define the available colors
const colors = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
  "orange",
];

const ColorPicker = ({ selectedColor, onColorChange, refinedColors }) => {
  return (
    <Box
      sx={{ display: "flex", flexWrap: "wrap", gap: 1, padding: "15px 0px" }}
    >
      {colors.map((color) => (
        <Tooltip title={color} sx={{ marginRight: 1, marginLeft: 1 }}>
          <Box
            key={color}
            variant="contained"
            sx={{
              backgroundColor: refinedColors[color],
              color: "white",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              "&:hover": {
                opacity: 0.8,
                cursor: "pointer",
              },
              ...(selectedColor === color && {
                border: "2px solid black", // Highlight the selected color
              }),
            }}
            onClick={() => onColorChange(color)} // Change color on click
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default ColorPicker;
