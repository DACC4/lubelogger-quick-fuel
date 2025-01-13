import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { syncService } from '../services/syncService';
import { WifiOff, Cloud, AlertCircle } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingLogs, setPendingLogs] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkPendingLogs = async () => {
      const logs = await storageService.getPendingLogs();
      setPendingLogs(logs.length);
    };

    checkPendingLogs();
    
    // Check pending logs every minute
    const interval = setInterval(checkPendingLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isOffline && pendingLogs === 0) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full shadow-lg">
        <Cloud className="h-4 w-4" />
        <span className="text-sm">Connected</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {isOffline && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-full shadow-lg">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">Offline Mode</span>
        </div>
      )}
      
      {pendingLogs > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            {pendingLogs} log{pendingLogs === 1 ? '' : 's'} pending sync
          </span>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;