import { useState, useCallback } from 'react'
import Notification from './Notification'
import React from 'react'


const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  )
}

export default NotificationContainer ;


