import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Briefcase, User, ShieldAlert } from 'lucide-react';

export default function Sidebar({ user }) {
  if (!user) return null;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.spacer}></div>
      <div style={styles.menu}>
        <NavLink 
          to="/" 
          style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/destinations" 
          style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
        >
          <Compass size={20} />
          <span>Explore</span>
        </NavLink>

        <NavLink 
          to="/trips" 
          style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
        >
          <Briefcase size={20} />
          <span>My Trips</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
        >
          <User size={20} />
          <span>My Profile</span>
        </NavLink>

        {user.role === 'ADMIN' && (
          <>
            <div style={styles.divider}></div>
            <span style={styles.sectionHeader}>Admin Console</span>
            <NavLink 
              to="/admin" 
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
            >
              <ShieldAlert size={20} style={{ color: '#c084fc' }} />
              <span style={{ color: '#c084fc' }}>Manage Platform</span>
            </NavLink>
          </>
        )}
      </div>
      <div style={styles.footer}>
        <p style={styles.footerText}>Travel Genius v1.0</p>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#111827',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 90,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
  },
  spacer: {
    height: '70px', // Matches Navbar height
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1.5rem',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    color: '#9ca3af',
    textDecoration: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    color: '#3b82f6',
    fontWeight: '600',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '1.5rem 0 1rem 0',
  },
  sectionHeader: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    paddingLeft: '1rem',
    marginBottom: '0.5rem',
  },
  footer: {
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#4b5563',
    textAlign: 'center',
  },
};
