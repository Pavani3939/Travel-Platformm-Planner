import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { KeyRound, User, Mail, UserCheck } from 'lucide-react';

export default function Register({ onLoginSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!fullName.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await api.post('/auth/register', {
        fullName,
        email,
        username,
        password,
      });
      onLoginSuccess(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to register. Username may be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card animate-slide-up">
        <div className="auth-header">
          <span style={styles.logoIcon}>✈️</span>
          <h1>Create Account</h1>
          <p>Join Travel Genius to plan trips</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={styles.inputContainer}>
              <UserCheck size={18} style={styles.inputIcon} />
              <input
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputContainer}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={styles.inputContainer}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="johndoe"
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={styles.inputContainer}>
              <KeyRound size={18} style={styles.inputIcon} />
              <input
                type="password"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
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
};
