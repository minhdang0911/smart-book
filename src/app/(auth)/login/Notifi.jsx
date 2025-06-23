'use client';

import React, { useEffect } from 'react';
import './CustomNotification.css';

export default function CustomNotification({ message, description, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="custom-notification">
      <div className="notification-content">
        <strong>{message}</strong>
        <p>{description}</p>
      </div>
      <span className="close-btn" onClick={onClose}>×</span>
    </div>
  );
}
