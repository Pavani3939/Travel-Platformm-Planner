import React from 'react';

export default function StatCard({ title, value, icon, subtext, color = '#3b82f6' }) {
  return (
    <div className="glass-card animate-slide-up" style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        {icon && <div style={{ ...styles.iconContainer, color, backgroundColor: `${color}15` }}>{icon}</div>}
      </div>
      <div style={styles.body}>
        <h2 style={styles.value}>{value}</h2>
        {subtext && <p style={styles.subtext}>{subtext}</p>}
      </div>
      <div style={{ ...styles.indicator, background: color }}></div>
    </div>
  );
}

const styles = {
  card: {
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '130px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  iconContainer: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  value: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1,
  },
  subtext: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
  },
};
