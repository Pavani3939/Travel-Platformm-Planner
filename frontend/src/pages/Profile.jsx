import React from 'react';
import { User, Mail, Shield, ShieldCheck, MapPin } from 'lucide-react';

export default function Profile({ user }) {
  if (!user) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>My User <span className="gradient-text">Profile</span></h1>
          <p>View details of your registered account.</p>
        </div>
      </div>

      <div className="glass-card" style={styles.card}>
        <div style={styles.avatarSection}>
          <div style={styles.largeAvatar}>
            {user.role === 'ADMIN' ? <ShieldCheck size={40} /> : <User size={40} />}
          </div>
          <div style={styles.avatarDetails}>
            <h2>{user.fullName}</h2>
            <span 
              style={{ 
                ...styles.roleBadge, 
                backgroundColor: user.role === 'ADMIN' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: user.role === 'ADMIN' ? '#c084fc' : '#60a5fa'
              }}
            >
              {user.role === 'ADMIN' ? 'Administrator' : 'Standard Member'}
            </span>
          </div>
        </div>

        <div style={styles.profileDetailsList}>
          <div style={styles.detailItem}>
            <div style={styles.detailLabelContainer}>
              <User size={18} style={styles.icon} />
              <span style={styles.detailLabel}>Username</span>
            </div>
            <strong style={styles.detailVal}>{user.username}</strong>
          </div>

          <div style={styles.detailItem}>
            <div style={styles.detailLabelContainer}>
              <Mail size={18} style={styles.icon} />
              <span style={styles.detailLabel}>Email Address</span>
            </div>
            <strong style={styles.detailVal}>{user.email}</strong>
          </div>

          <div style={styles.detailItem}>
            <div style={styles.detailLabelContainer}>
              <Shield size={18} style={styles.icon} />
              <span style={styles.detailLabel}>Permission Role</span>
            </div>
            <strong style={styles.detailVal}>{user.role}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '2rem',
  },
  largeAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  },
  avatarDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  roleBadge: {
    display: 'inline-block',
    alignSelf: 'flex-start',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  profileDetailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  detailLabelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  detailLabel: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  detailVal: {
    color: '#ffffff',
    fontSize: '0.95rem',
  },
  icon: {
    color: '#6b7280',
  },
};
