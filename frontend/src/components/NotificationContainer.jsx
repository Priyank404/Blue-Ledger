import { useState, useCallback } from 'react'
import Notification from './Notification'

let notificationId = 0

export const useNotification = () => {
  const [notifications, setNotifications] = useState([])

  const showNotification = useCallback((message, type = 'info') => {
    const id = notificationId++
    const newNotification = { id, message, type }
    
    setNotifications((prev) => [...prev, newNotification])
    
    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return { showNotification, removeNotification, notifications }
}

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

export default NotificationContainer

