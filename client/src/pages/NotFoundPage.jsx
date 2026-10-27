import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <main className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
      <div className="empty-state">
        <span className="empty-icon" role="img" aria-label="Page not found">
          🎬
        </span>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
        <h2>Scene Not Found</h2>
        <p style={{ maxWidth: '460px', margin: '0.75rem auto 1.75rem' }}>
          The page or scene you are looking for does not exist, was moved, or requires different access.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Movie Hub
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;

