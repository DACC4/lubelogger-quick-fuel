import React, { useState, useEffect } from 'react';
import { syncService } from '../services/syncService';
import { storageService } from '../services/storageService';

const FUEL_TYPES = ['SP95', 'SP98', 'SP100', 'E10', 'E20'];

const FuelLogForm = ({ vehicle, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    fuelConsumed: '',
    cost: '',
    isFillToFull: true,
    fuelType: 'SP95'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  // Load saved form data on mount
  useEffect(() => {
    const loadSavedForm = async () => {
      const saved = await storageService.getFormData(vehicle.id);
      if (saved && saved.data) {
        saved.data.date = new Date().toISOString().split('T')[0]; // Reset form date
        setFormData(saved.data);
      }
    };
    loadSavedForm();
  }, []);

  // Save form data when it changes
  useEffect(() => {
    const saveForm = async () => {
      await storageService.saveFormData(vehicle.id, formData);
      setSaveStatus('Form saved');
      const timer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(timer);
    };
    saveForm();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
        missedFuelUp: false
      };

      const success = await syncService.addLog(vehicle.id, logData);

      if (success) {
        await storageService.clearFormData();
        setFormData({
          date: new Date().toISOString().split('T')[0],
          odometer: '',
          fuelConsumed: '',
          cost: '',
          isFillToFull: true,
          fuelType: 'SP95'
        });
        onSuccess?.();
      } else {
        setError('Log saved offline. Will sync when connection is restored.');
      }
    } catch (err) {
      setError('Failed to save fuel log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 dark:bg-[var(--dark-bg-color)]">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-[var(--dark-text-color)]">New Fuel Log</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status container with fixed height to prevent form from moving up and down */}
        <div className="h-12 mb-4">
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300">
              {error}
            </div>
          )}
          {!error && (
            <div className="text-sm text-gray-500 text-right h-6 dark:text-[var(--dark-border-color)]">
              {saveStatus}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--dark-text-color)]">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[var(--dark-input-bg-color)] dark:border-[var(--dark-border-color)] dark:text-[var(--dark-text-color)]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--dark-text-color)]">Odometer</label>
          <input
            type="number"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[var(--dark-input-bg-color)] dark:border-[var(--dark-border-color)] dark:text-[var(--dark-text-color)]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--dark-text-color)]">Fuel Consumed (L)</label>
          <input
            type="number"
            name="fuelConsumed"
            value={formData.fuelConsumed}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[var(--dark-input-bg-color)] dark:border-[var(--dark-border-color)] dark:text-[var(--dark-text-color)]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--dark-text-color)]">Total Cost</label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[var(--dark-input-bg-color)] dark:border-[var(--dark-border-color)] dark:text-[var(--dark-text-color)]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--dark-text-color)]">Fuel Type</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[var(--dark-input-bg-color)] dark:border-[var(--dark-border-color)] dark:text-[var(--dark-text-color)]"
            required
          >
            {FUEL_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isFillToFull"
            checked={formData.isFillToFull}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-[var(--dark-input-bg-color)] dark:border-[var(--dark-border-color)]"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-[var(--dark-text-color)]">
            Filled to full tank
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-[var(--dark-hover-color)]"
        >
          {isSubmitting ? 'Saving...' : 'Save Fuel Log'}
        </button>
      </form>
    </div>
  );
};

export default FuelLogForm;