import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;

