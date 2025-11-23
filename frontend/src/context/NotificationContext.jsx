import React, { createContext, useContext, useState, useCallback } from "react";
import NotificationContainer from "../components/NotificationContainer";

const NotificationContext = createContext();

let idCounter = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = "info") => {
    const id = ++idCounter;
    setNotifications(prev => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // EXPOSE EVERYTHING
  return (
    <NotificationContext.Provider value={{ showNotification, notifications, removeNotification }}>
      {children}

      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
