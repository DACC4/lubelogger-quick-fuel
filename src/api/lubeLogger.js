class LubeLoggerAPI {
  constructor() {
    this.baseURL = null;
    this.auth = null;
  }

  setAuth(username, password) {
    this.auth = btoa(`${username}:${password}`);
  }

  clearAuth() {
    this.auth = null;
  }

  async request(endpoint, options = {}) {
    if (!this.baseURL) {
      throw new Error("API baseURL not set");
    }

    const headers = {
      ...(this.auth && { Authorization: `Basic ${this.auth}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth
  async validateCredentials(lubeLoggerURL, username, password) {
    this.setAuth(username, password);
    this.baseURL = lubeLoggerURL;
    try {
      // Test credentials by fetching vehicles
      await this.getVehicles();
      return true;
    } catch (error) {
      this.clearAuth();
      return false;
    }
  }

  // Vehicles
  async getVehicles() {
    const allVehicles = await this.request("/api/vehicles");
    return allVehicles.filter((vehicle) => vehicle.soldDate == null);
  }

  async getVehicleInfo(vehicleId) {
    return this.request(`/api/vehicle/info?vehicleId=${vehicleId}`);
  }

  // Gas Records
  async addGasRecord(vehicleId, data) {
    const formData = new FormData();

    // Add basic fields
    formData.append("date", data.date);
    formData.append("odometer", data.odometer.toString());
    formData.append("fuelConsumed", data.fuelConsumed.toString());
    formData.append("cost", data.cost.toString());
    formData.append("isFillToFull", data.isFillToFull.toString());
    formData.append("missedFuelUp", "false"); // Default to false since it's not in the form
    formData.append("notes", "Added from LubeLogger Quick Fuel");

    // Add fuel type as tag
    formData.append("tags", data.fuelType);

    // Add fuel type as extra field
    formData.append("extrafields[0][name]", "Fuel type");
    formData.append("extrafields[0][value]", data.fuelType);

    return this.request(`/api/vehicle/gasrecords/add?vehicleId=${vehicleId}`, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type header - let the browser set it with the boundary
      },
    });
  }
}

export const api = new LubeLoggerAPI();
