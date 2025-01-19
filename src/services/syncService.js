import { api } from "../api/lubeLogger";
import { storageService } from "./storageService";

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInterval = null;
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncPendingLogs();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  startAutoSync(intervalMs = 60000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => this.syncPendingLogs(), intervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncPendingLogs() {
    if (!this.isOnline) return;

    const pendingLogs = await storageService.getPendingLogs();

    for (const log of pendingLogs) {
      try {
        await api.addGasRecord(log.data.vehicleId, log.data);
        await storageService.removePendingLog(log.id);
      } catch (error) {
        console.error("Failed to sync log:", error);
        // Keep the log in pending state if sync fails
      }
    }
  }

  async addLog(vehicleId, logData) {
    if (this.isOnline) {
      try {
        await api.addGasRecord(vehicleId, logData);
        return true;
      } catch (error) {
        console.error("Failed to add log, storing offline:", error);
        await storageService.addPendingLog({
          vehicleId,
          ...logData,
        });
        return false;
      }
    } else {
      await storageService.addPendingLog({
        vehicleId,
        ...logData,
      });
      return false;
    }
  }

  isOffline() {
    return !this.isOnline;
  }
}

export const syncService = new SyncService();
