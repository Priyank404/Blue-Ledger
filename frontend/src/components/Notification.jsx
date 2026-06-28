import React, { useEffect, useState, useRef } from 'react';

const TYPE_STYLE = {
  success: 'profit',
  error: 'loss',
  warning: 'text-[var(--warning)]',
  info: 'muted',
};

/**
 * Accessible notification toast.
 * Uses a stable ref for `onClose` to prevent effect/timer resets on parent re-renders.
 */
const Notification = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    // 5-second auto-close
    const autoCloseTimer = setTimeout(() => {
      setIsVisible(false);
      const exitTimer = setTimeout(() => {
        if (onCloseRef.current) onCloseRef.current();
      }, 300);
      return () => clearTimeout(exitTimer);
    }, 5000);

    return () => clearTimeout(autoCloseTimer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onCloseRef.current) onCloseRef.current();
    }, 300);
  };

  return (
    <div
      role="alert"
      className={`min-w-[300px] max-w-md rounded border p-4 transition-all duration-300 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-2 opacity-0 scale-95'
      }`}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--line)',
        willChange: 'transform, opacity',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <p className={`text-sm font-medium ${TYPE_STYLE[type] || ''}`}>{message}</p>
        <button
          onClick={handleClose}
          className="text-sm font-semibold muted hover:text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--line-strong)] rounded px-1 transition-colors"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Notification;
