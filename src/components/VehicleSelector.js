import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid2,
  CircularProgress,
  Paper,
} from "@mui/material";

import { api } from "../api/lubeLogger";
import { storageService } from "../services/storageService";

const VehicleSelector = ({ onVehicleSelect }) => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVehicles = async () => {
    try {
      // Try to get from cache first
      const cached = await storageService.getVehicles();
      if (cached) {
        setVehicles(cached.data);
        setIsLoading(false);
      }

      // Then try fresh data from API
      const freshVehicles = await api.getVehicles();
      await storageService.saveVehicles(freshVehicles);
      setVehicles(freshVehicles);
      setError(null);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      // If we have no vehicles at all, show error
      if (!vehicles.length) {
        setError("Failed to load vehicles. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !vehicles.length) {
    return (
      <Box textAlign="center" p={2}>
        <Typography color="error" mb={2}>
          {error}
        </Typography>
        <Button variant="contained" onClick={loadVehicles}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        Select Vehicle
      </Typography>

      <Grid2 container spacing={2}>
        {vehicles.map((vehicle) => (
          <Grid2 item xs={12} sm={6} key={vehicle.id}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
              onClick={() => onVehicleSelect(vehicle)}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
              </Typography>
            </Paper>
          </Grid2>
        ))}
      </Grid2>

      {!vehicles.length && (
        <Typography
          variant="body2"
          color="text.secondary"
          mt={2}
          textAlign="center"
        >
          No vehicles found
        </Typography>
      )}
    </Box>
  );
};

export default VehicleSelector;
