// SettingsModal.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
  Box,
  Paper,
  FormControlLabel,
  Switch,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "../hooks/useAuth";
import { storageService } from "../services/storageService";

// 1) Import your custom theme hook
import { useCustomTheme } from "../ThemeProvider";

const SettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLogs, setPendingLogs] = useState([]);
  const { logout } = useAuth();

  // 2) Access the current mode ('light' or 'dark') and the toggle function
  const { mode, toggleTheme } = useCustomTheme();

  useEffect(() => {
    if (isOpen) {
      loadPendingLogs();
    }
  }, [isOpen]);

  const loadPendingLogs = async () => {
    const logs = await storageService.getPendingLogs();
    setPendingLogs(logs);
  };

  const clearPendingLogs = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all pending logs? This cannot be undone."
    );
    if (confirmClear) {
      await storageService.clearPendingLogs();
      setPendingLogs([]);
    }
  };

  const handleLogout = async () => {
    if (pendingLogs.length > 0) {
      const confirmLogout = window.confirm(
        "You have pending logs that haven't been synced. Are you sure you want to logout?"
      );
      if (!confirmLogout) return;
    }
    await logout();
  };

  return (
    <>
      {/* Settings Button in your UI */}
      <IconButton
        onClick={() => setIsOpen(true)}
        color="inherit"
        aria-label="open settings"
      >
        <SettingsIcon />
      </IconButton>

      {/* Modal (Dialog) */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Settings</Typography>
          <IconButton
            onClick={() => setIsOpen(false)}
            aria-label="close settings dialog"
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Pending Logs Section */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Pending Logs
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2">
                {pendingLogs.length} log{pendingLogs.length !== 1 ? "s" : ""} pending
                synchronization
              </Typography>
              {pendingLogs.length > 0 && (
                <Button
                  onClick={clearPendingLogs}
                  startIcon={<DeleteIcon />}
                  color="error"
                  sx={{ mt: 1 }}
                >
                  Clear pending logs
                </Button>
              )}
            </Paper>
          </Box>

          {/* 3) Add a switch to toggle the theme */}
          <FormControlLabel
            control={
              <Switch
                checked={mode === "dark"} // Reflect current mode
                onChange={toggleTheme}     // Call toggleTheme on switch
                color="primary"
              />
            }
            label="Dark Mode"
            sx={{ mb: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsModal;
