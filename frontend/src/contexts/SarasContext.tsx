import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { aiService } from '@/services/ai';

interface SarasContextType {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
  checkStatus: () => Promise<void>;
}

const SarasContext = createContext<SarasContextType | undefined>(undefined);

export const useSaras = () => {
  const context = useContext(SarasContext);
  if (context === undefined) {
    throw new Error('useSaras must be used within a SarasProvider');
  }
  return context;
};

interface SarasProviderProps {
  children: ReactNode;
}

export const SarasProvider: React.FC<SarasProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const response = await aiService.getHealth();
      setIsOnline(response.success);
      setLastChecked(new Date());
      
      if (!response.success) {
        setError('SARAS AI services are temporarily unavailable');
      }
    } catch (err) {
      setIsOnline(false);
      setError('Unable to connect to SARAS AI services');
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  // Check status on mount and periodically
  useEffect(() => {
    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // When network comes back online, check SARAS status
      checkStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError('No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value: SarasContextType = {
    isOnline,
    isChecking,
    lastChecked,
    error,
    checkStatus,
  };

  return (
    <SarasContext.Provider value={value}>
      {children}
    </SarasContext.Provider>
  );
};

export default SarasProvider;