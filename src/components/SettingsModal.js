import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { storageService } from '../services/storageService';
import { Settings, X, Trash2, LogOut } from 'lucide-react';

const SettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLogs, setPendingLogs] = useState([]);
  const { logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadPendingLogs();
    }
  }, [isOpen]);

  const loadPendingLogs = async () => {
    const logs = await storageService.getPendingLogs();
    setPendingLogs(logs);
  };

  const clearPendingLogs = async () => {
    if (window.confirm('Are you sure you want to clear all pending logs? This cannot be undone.')) {
      await storageService.clearPendingLogs();
      setPendingLogs([]);
    }
  };

  const handleLogout = async () => {
    if (pendingLogs.length > 0) {
      if (!window.confirm('You have pending logs that haven\'t been synced. Are you sure you want to logout?')) {
        return;
      }
    }
    await logout();
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[var(--dark-card-color)]"
      >
        <Settings className="h-6 w-6 text-gray-600 dark:text-[var(--dark-text-color)]" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          {/* Modal Content */}
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl dark:bg-[var(--dark-card-color)]">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b dark:border-[var(--dark-border-color)]">
              <h2 className="text-lg font-semibold dark:text-[var(--dark-text-color)]">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[var(--dark-card-color)]"
              >
                <X className="h-5 w-5 dark:text-[var(--dark-text-color)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Pending Logs Section */}
              <div>
                <h3 className="font-medium mb-2 dark:text-[var(--dark-text-color)]">Pending Logs</h3>
                <div className="bg-gray-50 rounded p-3 dark:bg-[var(--dark-input-bg-color)]">
                  <p className="text-sm text-gray-600 dark:text-[var(--dark-border-color)]">
                    {pendingLogs.length} log{pendingLogs.length !== 1 ? 's' : ''} pending synchronization
                  </p>
                  {pendingLogs.length > 0 && (
                    <button
                      onClick={clearPendingLogs}
                      className="mt-2 flex items-center text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear pending logs
                    </button>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsModal;