'use client';

import React, { useEffect, useState } from 'react';
import './CustomNotify.css';

export default function CustomNotify({ type = 'success', message = '', duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className={`toast-container`}>
      <div className={`toast toast-${type}`}>
        <span className="toast-icon">
          {type === 'success' && '✔️'}
          {type === 'error' && '❌'}
          {type === 'warning' && '⚠️'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
}
