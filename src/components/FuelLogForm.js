import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { syncService } from "../services/syncService";
import { storageService } from "../services/storageService";

const FUEL_TYPES = ["SP95", "SP98", "SP100", "E5", "E10", "E85"];

const FuelLogForm = ({ vehicle, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    odometer: "",
    fuelConsumed: "",
    cost: "",
    isFillToFull: true,
    fuelType: FUEL_TYPES[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  // Load saved form data on mount
  useEffect(() => {
    const loadSavedForm = async () => {
      const saved = await storageService.getFormData(vehicle.id);
      if (saved && saved.data) {
        // Reset form date to today's date if you like
        saved.data.date = new Date().toISOString().split("T")[0];
        setFormData(saved.data);
      }
    };
    loadSavedForm();
  }, [vehicle.id]);

  // Save form data when it changes
  useEffect(() => {
    const saveForm = async () => {
      await storageService.saveFormData(vehicle.id, formData);
      setSaveStatus("Form saved");
      const timer = setTimeout(() => setSaveStatus(""), 2000);
      return () => clearTimeout(timer);
    };
    saveForm();
  }, [vehicle.id, formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const logData = {
        ...formData,
        date: formData.date,
        odometer: parseFloat(formData.odometer),
        fuelConsumed: parseFloat(formData.fuelConsumed),
        cost: parseFloat(formData.cost),
        missedFuelUp: false,
      };

      const success = await syncService.addLog(vehicle.id, logData);

      if (success) {
        await storageService.clearFormData();
        setFormData({
          date: new Date().toISOString().split("T")[0],
          odometer: "",
          fuelConsumed: "",
          cost: "",
          isFillToFull: true,
          fuelType: "SP95",
        });
        onSuccess?.();
      } else {
        setError("Log saved offline. Will sync when connection is restored.");
      }
    } catch (err) {
      setError("Failed to save fuel log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxWidth="sm" mx="auto" p={2}>
      <Typography variant="h6" mb={2}>
        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
      </Typography>
      <Typography variant="subtitle1" mb={2}>
        New Fuel Log
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Error / Save Status */}
        <Box minHeight={40} mb={2}>
          {error ? (
            <Alert severity="warning">{error}</Alert>
          ) : (
            <Typography variant="body2" align="right" color="text.secondary">
              {saveStatus}
            </Typography>
          )}
        </Box>

        {/* Date */}
        <TextField
          name="date"
          label="Date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        {/* Odometer */}
        <TextField
          name="odometer"
          label="Odometer"
          type="number"
          value={formData.odometer}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />

        {/* Fuel Consumed */}
        <TextField
          name="fuelConsumed"
          label="Fuel Consumed (L)"
          type="number"
          value={formData.fuelConsumed}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />

        {/* Total Cost */}
        <TextField
          name="cost"
          label="Total Cost"
          type="number"
          value={formData.cost}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />

        {/* Fuel Type */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="fuel-type-label">Fuel Type</InputLabel>
          <Select
            labelId="fuel-type-label"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            label="Fuel Type"
            required
          >
            {FUEL_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Is Fill To Full */}
        <FormControlLabel
          control={
            <Checkbox
              name="isFillToFull"
              checked={formData.isFillToFull}
              onChange={handleChange}
            />
          }
          label="Filled to full tank"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? "Saving..." : "Save Fuel Log"}
        </Button>
      </Box>
    </Box>
  );
};

export default FuelLogForm;
