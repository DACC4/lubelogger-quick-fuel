import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Paper } from "@mui/material";

// You can replace MUI icons or keep lucide-react icons if you prefer.
// MUI icons for illustration:
import CloudIcon from "@mui/icons-material/Cloud";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { storageService } from "../services/storageService";

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingLogs, setPendingLogs] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkPendingLogs = async () => {
      const logs = await storageService.getPendingLogs();
      setPendingLogs(logs.length);
    };

    checkPendingLogs();
    // Check pending logs every minute
    const interval = setInterval(checkPendingLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  // If online and no pending logs
  if (!isOffline && pendingLogs === 0) {
    return (
      <Paper
        elevation={4}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          backgroundColor: theme.palette.success.light,
          color: theme.palette.success.contrastText,
        }}
      >
        <CloudIcon fontSize="small" />
        <Typography variant="body2">Connected</Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {isOffline && (
        <Paper
          elevation={4}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            bgcolor: theme.palette.warning.light,
            color: theme.palette.warning.contrastText,
          }}
        >
          <WifiOffIcon fontSize="small" />
          <Typography variant="body2">Offline Mode</Typography>
        </Paper>
      )}

      {pendingLogs > 0 && (
        <Paper
          elevation={4}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            bgcolor: theme.palette.info.light,
            color: theme.palette.info.contrastText,
          }}
        >
          <WarningAmberIcon fontSize="small" />
          <Typography variant="body2">
            {pendingLogs} log{pendingLogs === 1 ? "" : "s"} pending sync
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default OfflineIndicator;
