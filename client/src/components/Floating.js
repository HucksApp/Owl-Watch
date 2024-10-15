import React from 'react'
import MenuIcon from "@mui/icons-material/Menu";
import { Fab,Slide } from "@mui/material";
const Floating = ({toggleAppBar, showAppBar}) => {
  return (
     <Slide direction="left" in={!showAppBar} mountOnEnter unmountOnExit>
      <Fab
        aria-label="menu"
        size="small"
        onClick={toggleAppBar}
        style={{ position: "fixed", bottom: 20, right: 20}} // Floating position
      >
        <MenuIcon  sx={{ fontWeight: "1000" }} />
      </Fab>
      </Slide>
  )
}

export default Floating