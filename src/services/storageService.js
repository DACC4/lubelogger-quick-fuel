// src/services/storageService.js

class StorageService {
  constructor() {
    this.KEYS = {
      CREDENTIALS: 'fuel_logger_credentials',
      VEHICLES: 'fuel_logger_vehicles',
      PENDING_LOGS: 'fuel_logger_pending_logs',
      FORM_DATA: 'fuel_logger_form_data'
    };
  }

  // Credentials management
  async saveCredentials(username, password) {
    const encrypted = btoa(JSON.stringify({ username, password }));
    localStorage.setItem(this.KEYS.CREDENTIALS, encrypted);
  }

  async getCredentials() {
    const encrypted = localStorage.getItem(this.KEYS.CREDENTIALS);
    if (!encrypted) return null;
    return JSON.parse(atob(encrypted));
  }

  async clearCredentials() {
    localStorage.removeItem(this.KEYS.CREDENTIALS);
  }

  // Vehicles cache
  async saveVehicles(vehicles) {
    localStorage.setItem(this.KEYS.VEHICLES, JSON.stringify({
      timestamp: Date.now(),
      data: vehicles,
    }));
  }

  async getVehicles() {
    const cached = localStorage.getItem(this.KEYS.VEHICLES);
    if (!cached) return null;
    return JSON.parse(cached);
  }

  // Pending fuel logs
  async addPendingLog(log) {
    const pending = await this.getPendingLogs();
    pending.push({
      id: Date.now(),
      data: log,
      timestamp: Date.now(),
    });
    localStorage.setItem(this.KEYS.PENDING_LOGS, JSON.stringify(pending));
  }

  async getPendingLogs() {
    const logs = localStorage.getItem(this.KEYS.PENDING_LOGS);
    return logs ? JSON.parse(logs) : [];
  }

  async removePendingLog(id) {
    const pending = await this.getPendingLogs();
    const updated = pending.filter(log => log.id !== id);
    localStorage.setItem(this.KEYS.PENDING_LOGS, JSON.stringify(updated));
  }

  async clearPendingLogs() {
    localStorage.setItem(this.KEYS.PENDING_LOGS, JSON.stringify([]));
  }

  // Form data persistence
  async saveFormData(vehicle_id, data) {
    localStorage.setItem(this.KEYS.FORM_DATA + '_id' + vehicle_id, JSON.stringify({
      timestamp: Date.now(),
      data,
    }));
  }

  async getFormData(vehicle_id) {
    const saved = localStorage.getItem(this.KEYS.FORM_DATA + '_id' + vehicle_id);
    return saved ? JSON.parse(saved) : null;
  }

  async clearFormData() {
    localStorage.removeItem(this.KEYS.FORM_DATA);
  }
}

export const storageService = new StorageService();