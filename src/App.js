import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CustomThemeProvider } from "./ThemeProvider";
import { useAuth } from "./hooks/useAuth";
import LoginForm from "./components/LoginForm";
import VehicleSelector from "./components/VehicleSelector";
import FuelLogForm from "./components/FuelLogForm";
import OfflineIndicator from "./components/OfflineIndicator";
import { syncService } from "./services/syncService";
import SettingsModal from "./components/SettingsModal";

import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const AuthenticatedApp = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleLogSuccess = () => {
    // Optionally handle success state
  };

  return (
    <Box minHeight="100vh">
      {/* Header / AppBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            LubeLogger Quick Fuel
          </Typography>
          <SettingsModal />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {!selectedVehicle ? (
          <VehicleSelector onVehicleSelect={handleVehicleSelect} />
        ) : (
          <Box>
            <Box display="flex" alignItems="center" mb={3}>
              <Button
                onClick={() => setSelectedVehicle(null)}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              <Typography variant="h6" ml={2}>
                {selectedVehicle.name}
              </Typography>
            </Box>
            <Paper variant="outlined">
              <FuelLogForm vehicle={selectedVehicle} onSuccess={handleLogSuccess} />
            </Paper>
          </Box>
        )}
      </Container>

      {/* Offline status indicator */}
      <OfflineIndicator />
    </Box>
  );
};

const App = () => {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CustomThemeProvider>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      syncService.startAutoSync();
      return () => syncService.stopAutoSync();
    }
  }, [isAuthenticated]);

  return isAuthenticated ? <AuthenticatedApp /> : <LoginForm />;
};

export default App;
