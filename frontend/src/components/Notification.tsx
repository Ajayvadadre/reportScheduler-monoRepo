import React, { createContext, useContext, useState, useCallback } from 'react';

// 1. Define what a Notification object looks like
export interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  triggerNotification: (message: string, type: NotificationItem['type']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Function to add a notification and automatically queue its removal
  const triggerNotification = useCallback((message: string, type: NotificationItem['type']) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remove notification after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ triggerNotification }}>
      {children}
      
      {/* 2. Floating UI Container for Toasts (Fixed position in viewport) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-xs w-full">
        {notifications.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Custom hook for clean usage across the application
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};

// 3. Visual UI Component for an individual Toast Card (Tailwind CSS)
const ToastCard: React.FC<{ toast: NotificationItem }> = ({ toast }) => {
  const bgColor = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600'
  }[toast.type];

  return (
    <div 
      className={`p-4 text-white text-sm rounded-xl shadow-lg border animate-slide-in ${bgColor}`}
      role="alert"
      tabIndex={-1}
    >
      <div className="flex justify-between items-center">
        <span>{toast.message}</span>
      </div>
    </div>
  );
};