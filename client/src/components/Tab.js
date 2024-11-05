import React from "react";
import {
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tooltip,
  Checkbox,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import PushPinIcon from "@mui/icons-material/PushPin";
import SwitchAccessShortcutIcon from "@mui/icons-material/SwitchAccessShortcut";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { useCommandStructure } from "../contexts/CommandStructureContext";
import { format } from "date-fns";
import "../styles/list.css";

const Tab = ({ tab, checkeable, handleChecked, handleChange }) => {
  const { closeTab, switchToTab, pinUnpinTab, makeTabDormant, muteUnmuteTab } =
    useCommandStructure();

  return (
    <div className="listcontentContainer">
      <div className="listcontentInfo">
        <ListItemIcon>
          {checkeable ? (
            <Checkbox
              edge="start"
              size="small"
              checked={handleChecked(tab)} // Check if this tab is selected
              onChange={() => handleChange(tab)} // Handle selection change
              tabIndex={-1}
              disableRipple
              icon={
                tab.favIconUrl ? (
                  <Avatar
                    sx={{ width: 24, height: 24 }}
                    alt={tab.title}
                    src={tab.favIconUrl}
                  />
                ) : (
                  <Avatar sx={{ width: 24, height: 24 }}>OWL</Avatar>
                )
              }
            />
          ) : tab.favIconUrl ? (
            <Avatar
              sx={{ width: 24, height: 24 }}
              alt={tab.title}
              src={tab.favIconUrl}
            />
          ) : (
            <Avatar sx={{ width: 24, height: 24 }}>OWL</Avatar>
          )}
        </ListItemIcon>
        <ListItemText
          primary={`${tab.title || tab.url}`}
          secondary={`Last Accessed: ${
            tab.lastAccessed !== "Recent"
              ? format(new Date(tab.lastAccessed), "PPPpp")
              : "Recent"
          }`}
        />
      </div>

      <div className="listcontentButtons">
        <Tooltip title={tab.pinned ? "Unpin  Tab" : "pin Tab"}>
          <IconButton onClick={() => pinUnpinTab(tab.id, !tab.pinned)}>
            {tab.pinned ? (
              <PushPinIcon
                sx={{
                  fontWeight: 1000,
                  color: "#6610F2",
                }}
                fontSize="small"
              />
            ) : (
              <PushPinIcon
                sx={{
                  fontWeight: 1000,
                  color: "#10BECD",
                }}
                fontSize="small"
              />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Make Tab Dormant">
          <IconButton color="primary" onClick={() => makeTabDormant(tab.id)}>
            <PauseCircleFilledIcon
              sx={{
                fontWeight: 1000,
                color: "#10BECD",
              }}
              fontSize="small"
            />
          </IconButton>
        </Tooltip>

        <Tooltip title={tab.mutedInfo.muted ? "Unmute Tab" : "Mute Tab"}>
          <IconButton
            onClick={() => muteUnmuteTab(tab.id, !tab.mutedInfo.muted)}
          >
            {tab.mutedInfo.muted ? (
              <VolumeOffIcon
                sx={{
                  fontWeight: 1000,
                  color: "#6610F2",
                }}
                fontSize="small"
              />
            ) : (
              <VolumeUpIcon
                sx={{
                  fontWeight: 1000,
                  color: "#10BECD",
                }}
                fontSize="small"
              />
            )}
          </IconButton>
        </Tooltip>

        {!tab.isActive && (
          <Tooltip title="Switch To Tab">
            <IconButton onClick={() => switchToTab(tab.id)}>
              <SwitchAccessShortcutIcon
                sx={{
                  fontWeight: 1000,
                  color: "#10BECD",
                }}
                fontSize="small"
              />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Close Tab">
          <IconButton onClick={() => closeTab(tab.id)}>
            <CancelIcon
              sx={{
                fontWeight: 1000,
                color: "#10BECD",
              }}
              fontSize="small"
            />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default Tab;
