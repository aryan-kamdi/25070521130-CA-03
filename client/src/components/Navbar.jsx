import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" aria-label="FLEXI Movies Home">
          <span>🎬 FLEXI</span>
          <span className="brand-badge">HUB</span>
        </Link>

        {/* Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                end
              >
                🏠 Home
              </NavLink>
            </li>

            {isAuthenticated && (
              <li>
                <NavLink
                  to="/watchlist"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  🔖 Watchlist
                  {user?.watchlist?.length > 0 && (
                    <span
                      style={{
                        background: 'var(--accent-gold)',
                        color: '#000',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '999px',
                        marginLeft: '0.2rem'
                      }}
                    >
                      {user.watchlist.length}
                    </span>
                  )}
                </NavLink>
              </li>
            )}

            {isAuthenticated && isAdmin && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  ⚙️ Admin Panel
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Auth / Profile Area */}
        <div className="nav-user">
          {isAuthenticated ? (
            <>
              <div className="user-badge" title={user?.email}>
                <span>👤 {user?.name}</span>
                {isAdmin && <span className="admin-tag">ADMIN</span>}
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
                aria-label="Log out of account"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

