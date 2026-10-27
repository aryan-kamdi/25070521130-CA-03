import React from 'react';

const Toast = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => onClose(toast.id)}
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;

