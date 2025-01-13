import React, { useState, useEffect } from 'react';
import { api } from '../api/lubeLogger';
import { storageService } from '../services/storageService';

const VehicleSelector = ({ onVehicleSelect }) => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      // First try to get from cache
      const cached = await storageService.getVehicles();
      if (cached) {
        setVehicles(cached.data);
        setIsLoading(false);
      }

      // Then try to get fresh data from API
      const freshVehicles = await api.getVehicles();
      await storageService.saveVehicles(freshVehicles);
      setVehicles(freshVehicles);
      setError(null);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      // If we have cached data, don't show error
      if (!vehicles.length) {
        setError('Failed to load vehicles. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin h-6 w-6 border-4 border-blue-500 rounded-full border-t-transparent dark:border-[var(--dark-hover-color)]"></div>
      </div>
    );
  }

  if (error && !vehicles.length) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 mb-2 dark:text-red-400">{error}</div>
        <button 
          onClick={loadVehicles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-[var(--dark-hover-color)] dark:hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-[var(--dark-text-color)]">Select Vehicle</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => onVehicleSelect(vehicle)}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left flex flex-col dark:border-[var(--dark-border-color)] dark:hover:bg-[var(--dark-input-bg-color)] dark:text-[var(--dark-text-color)]"
          >
            <span className="font-medium">{vehicle.make} {vehicle.model} ({vehicle.licensePlate})</span>
          </button>
        ))}
      </div>
      {!vehicles.length && (
        <div className="text-center text-gray-600 mt-4 dark:text-[var(--dark-border-color)]">
          No vehicles found
        </div>
      )}
    </div>
  );
};

export default VehicleSelector;