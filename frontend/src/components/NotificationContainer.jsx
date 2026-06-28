import React from 'react';
import Notification from './Notification';

/**
 * Container to mount notifications at the top right of the viewport.
 * Uses screen reader assertive settings to announce new toasts to screen readers.
 */
const NotificationContainer = ({ notifications = [], onRemove }) => {
  return (
    <div 
      className="fixed right-4 top-4 z-50 space-y-2" 
      aria-live="assertive" 
      aria-relevant="additions"
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
