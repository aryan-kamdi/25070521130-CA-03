import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to destination or home
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegister && !formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password);
        showToast('Registration successful! Welcome to FLEXI Movies.', 'success');
      } else {
        await login(formData.email, formData.password);
        showToast('Welcome back!', 'success');
      }
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for grading / demo testing
  const fillCredentials = (email, password) => {
    setFormData({
      name: isRegister ? 'Test Student' : '',
      email,
      password
    });
    setErrorMsg('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🎬</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800 }}>
              FLEXI <span style={{ color: 'var(--accent-gold)' }}>HUB</span>
            </span>
          </Link>
          <p style={{ fontSize: '0.95rem' }}>
            {isRegister
              ? 'Join the community, review movies & curate your watchlist.'
              : 'Sign in to access your movie watchlist & share reviews.'}
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
            }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div
            className="toast toast-error"
            style={{ marginBottom: '1.25rem', position: 'static' }}
            role="alert"
          >
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-name" className="form-label">
                Full Name *
              </label>
              <input
                id="auth-name"
                name="name"
                type="text"
                autoComplete="name"
                className="form-input"
                placeholder="e.g. Aryan Sharma"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">
              Email Address *
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              className="form-input"
              placeholder="e.g. user@flexi.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">
              Password *
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="form-input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : isRegister
              ? 'Complete Registration'
              : 'Sign In to FLEXI'}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="demo-credentials">
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
            🔑 Demo Login Accounts (Click to auto-fill):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => fillCredentials('admin@flexi.com', 'Admin@123')}
            >
              <span>🛡️ Admin: <code>admin@flexi.com</code></span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Admin@123</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => fillCredentials('aryan@flexi.com', 'Aryan@123')}
            >
              <span>👤 User: <code>aryan@flexi.com</code></span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Aryan@123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

