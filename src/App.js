import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import VehicleSelector from './components/VehicleSelector';
import FuelLogForm from './components/FuelLogForm';
import OfflineIndicator from './components/OfflineIndicator';
import { syncService } from './services/syncService';
import SettingsModal from './components/SettingsModal';

// Main app content when authenticated
const AuthenticatedApp = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleLogSuccess = () => {
    // Optionally reset vehicle selection or show success message
    // For now, we'll just keep the form visible for multiple entries
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--dark-bg-color)]">
      {/* Header */}
      <header className="bg-white shadow dark:bg-[var(--dark-card-color)]">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-[var(--dark-text-color)]">LubeLogger Quick Fuel</h1>
          <SettingsModal />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {!selectedVehicle ? (
          <VehicleSelector onVehicleSelect={handleVehicleSelect} />
        ) : (
          <div>
            <div className="mb-6 flex items-center">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="mr-4 flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-[var(--dark-text-color)] dark:hover:text-[var(--dark-hover-color)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-[var(--dark-text-color)]">
                  {selectedVehicle.name}
                </h2>
              </div>
            </div>
            <FuelLogForm 
              vehicle={selectedVehicle} 
              onSuccess={handleLogSuccess} 
            />
          </div>
        )}
      </main>

      {/* Offline status indicator */}
      <OfflineIndicator />
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

// Separate component for content to use auth hook
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  // Start sync service when app loads
  React.useEffect(() => {
    if (isAuthenticated) {
      syncService.startAutoSync();
      return () => syncService.stopAutoSync();
    }
  }, [isAuthenticated]);

  return isAuthenticated ? <AuthenticatedApp /> : <LoginForm />;
};

export default App;