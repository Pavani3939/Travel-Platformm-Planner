import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { KeyRound, User } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await api.post('/auth/login', { username, password });
      onLoginSuccess(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card animate-slide-up">
        <div className="auth-header">
          <span style={styles.logoIcon}>✈️</span>
          <h1>Welcome Back</h1>
          <p>Login to plan your next adventure</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={styles.inputContainer}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputContainer}>
              <KeyRound size={18} style={styles.inputIcon} />
              <input
                type="password"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>

        <div style={styles.demoCredentials}>
          <p style={styles.demoTitle}>Demo Accounts:</p>
          <div style={styles.demoList}>
            <div><span>User:</span> <code>user</code> / <code>user123</code></div>
            <div><span>Admin:</span> <code>admin</code> / <code>admin123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  logoIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#6b7280',
  },
  inputWithIcon: {
    paddingLeft: '2.75rem',
  },
  submitBtn: {
    width: '100%',
    marginTop: '1rem',
    borderRadius: '8px',
  },
  demoCredentials: {
    marginTop: '2rem',
    padding: '0.75rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
  },
  demoTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  },
  demoList: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
};
