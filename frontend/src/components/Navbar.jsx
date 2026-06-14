import React from 'react';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  if (!user) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.brandContainer}>
        <span style={styles.logoIcon}>✈️</span>
        <span style={styles.logoText}>Travel<span style={styles.logoAccent}>Genius</span></span>
      </div>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            <UserIcon size={16} />
          </div>
          <div style={styles.userDetail}>
            <span style={styles.userName}>{user.fullName}</span>
            <span style={styles.userEmail}>{user.email}</span>
          </div>
          {user.role === 'ADMIN' && (
            <span style={styles.adminBadge} title="Administrator Account">
              <Shield size={12} />
              ADMIN
            </span>
          )}
        </div>

        <button onClick={onLogout} style={styles.logoutBtn} title="Log Out">
          <LogOut size={18} />
          <span style={styles.logoutText}>Log Out</span>
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '70px',
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    zIndex: 100,
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoIcon: {
    fontSize: '1.5rem',
  },
  logoText: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.025em',
  },
  logoAccent: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    paddingRight: '1.5rem',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetail: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#f3f4f6',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: '#c084fc',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    marginLeft: '0.5rem',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    padding: '0.5rem',
    borderRadius: '6px',
  },
  logoutText: {
    '@media (max-width: 576px)': {
      display: 'none',
    },
  },
};
