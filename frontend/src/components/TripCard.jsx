import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { convertToINR } from '../utils/currency';

export default function TripCard({ trip, destination, onDelete }) {
  const destName = destination ? destination.name : 'Unknown Destination';
  const destCountry = destination ? destination.country : '';
  const imageUrl = destination ? destination.imageUrl : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';

  // Calculate total expenses in INR
  const totalExpenses = trip.expenses
    ? trip.expenses.reduce((sum, exp) => sum + convertToINR(exp.amount, exp.currency), 0)
    : 0;

  const budgetUsedPct = Math.min((totalExpenses / trip.budget) * 100, 100);
  const isOverBudget = totalExpenses > trip.budget;

  return (
    <div className="glass-card animate-slide-up" style={styles.card}>
      <div style={{ ...styles.imgContainer, backgroundImage: `url(${imageUrl})` }}>
        <div style={styles.overlay}>
          <h3 style={styles.title}>{destName}</h3>
          <span style={styles.country}>{destCountry}</span>
        </div>
        <button onClick={() => onDelete(trip.id)} style={styles.deleteBtn} title="Delete Trip">
          <Trash2 size={16} />
        </button>
      </div>

      <div style={styles.body}>
        <div style={styles.infoRow}>
          <Calendar size={16} style={styles.icon} />
          <span style={styles.infoText}>
            {trip.startDate} to {trip.endDate}
          </span>
        </div>

        <div style={styles.budgetSection}>
          <div style={styles.budgetHeader}>
            <span style={styles.budgetLabel}>Budget Tracker</span>
            <span style={{ ...styles.budgetText, color: isOverBudget ? '#ef4444' : '#14b8a6' }}>
              ₹{totalExpenses.toFixed(0)} / ₹{trip.budget.toFixed(0)}
            </span>
          </div>
          <div style={styles.progressBarBg}>
            <div 
              style={{ 
                ...styles.progressBarFill, 
                width: `${budgetUsedPct}%`,
                background: isOverBudget 
                  ? 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)' 
                  : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
              }}
            ></div>
          </div>
        </div>

        <Link to={`/trips/${trip.id}`} className="btn btn-primary" style={styles.actionBtn}>
          <span>Itinerary & Expenses</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  imgContainer: {
    height: '160px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, rgba(11, 15, 25, 0.3) 50%, rgba(11, 15, 25, 0.1) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '1.25rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  country: {
    fontSize: '0.85rem',
    color: '#3b82f6',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  deleteBtn: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    backdropFilter: 'blur(4px)',
    transition: 'all 0.2s ease',
  },
  body: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  icon: {
    color: '#9ca3af',
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#f3f4f6',
    fontWeight: '500',
  },
  budgetSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  budgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  },
  budgetLabel: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  budgetText: {
    fontWeight: '600',
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease-out',
  },
  actionBtn: {
    marginTop: 'auto',
    width: '100%',
    borderRadius: '8px',
  },
};
