import React from 'react';

export default function Toast({ message, type }) {
  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: bgColor,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
      zIndex: 9999,
      fontSize: '14px',
      fontWeight: '500',
      animation: 'slideIn 0.3s ease',
    }}>
      {message}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}